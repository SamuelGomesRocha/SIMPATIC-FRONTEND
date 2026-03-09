import { useEffect, useState, useRef } from 'react';
import { Lightbulb } from 'lucide-react';
import type { LogEntry } from '../../types';
import { DICAS_LEI_14133 } from '../../config/constants';
import { formatDate } from '../../utils/helpers';

interface LoadingPageProps {
    logs: LogEntry[];
    /** Tipo de documento sendo processado. Padrão: 'DOD' */
    docType?: 'DOD' | 'ETP' | 'TR';
}

/**
 * Tela de carregamento com dicas sobre a Lei 14.133/2021
 * e console de logs em tempo real.
 */
export default function LoadingPage({ logs, docType = 'DOD' }: LoadingPageProps) {
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const logEndRef = useRef<HTMLDivElement>(null);

    // Rotaciona dicas a cada 6 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTipIndex((prev) => (prev + 1) % DICAS_LEI_14133.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll nos logs
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const isETP = docType === 'ETP';
    const isTR = docType === 'TR';

    const title = isTR
        ? 'Gerando Termo de Referência...'
        : isETP
            ? 'Gerando Estudo Técnico Preliminar...'
            : 'Gerando Sugestões...';

    const subtitle = isTR
        ? 'A inteligência artificial está analisando os dados consolidados e elaborando recomendações personalizadas para o Termo de Referência (TR).'
        : isETP
            ? 'A inteligência artificial está analisando os dados do DOD e elaborando recomendações personalizadas para o Estudo Técnico Preliminar (ETP).'
            : 'A inteligência artificial está analisando sua demanda e elaborando recomendações personalizadas para o DOD.';

    return (
        <div className="loading-page" id="loading-page">
            <div className="loading-card">
                <div className={`loading-spinner ${isETP || isTR ? 'loading-spinner--etp' : ''}`} />
                <h2 className="loading-card__title">{title}</h2>
                <p className="loading-card__subtitle">{subtitle}</p>

                {/* Dica rotativa */}
                <div className="tip-container">
                    <div className="tip-container__label">
                        <Lightbulb size={14} />
                        Você sabia? — Lei 14.133/2021
                    </div>
                    <p className="tip-container__text" key={currentTipIndex}>
                        {DICAS_LEI_14133[currentTipIndex]}
                    </p>
                </div>

                {/* Console de logs */}
                <div className="log-console" id="log-console">
                    <div className="log-console__header">
                        <span className="log-console__dot log-console__dot--red" />
                        <span className="log-console__dot log-console__dot--yellow" />
                        <span className="log-console__dot log-console__dot--green" />
                        <span className="log-console__title">
                            Console de Status {isTR ? '— TR' : isETP ? '— ETP' : '— DOD'}
                        </span>
                    </div>

                    {logs.length === 0 && (
                        <div className="log-entry log-entry--info">
                            <span className="log-entry__time">--:--:--</span>
                            <span className="log-entry__message">Aguardando início...</span>
                        </div>
                    )}

                    {logs.map((log) => (
                        <div key={log.id} className={`log-entry log-entry--${log.type}`}>
                            <span className="log-entry__time">
                                {formatDate(log.timestamp).split(' ')[1]}
                            </span>
                            <span className="log-entry__message">{log.message}</span>
                        </div>
                    ))}
                    <div ref={logEndRef} />
                </div>
            </div>
        </div>
    );
}
