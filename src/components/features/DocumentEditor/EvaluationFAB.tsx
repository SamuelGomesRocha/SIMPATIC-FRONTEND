import { ClipboardCheck } from 'lucide-react';
import './EvaluationPanel.css';

interface EvaluationFABProps {
    /** Se o FAB deve ser visível */
    visible: boolean;
    /** Offset Y para alinhar com o campo ativo */
    offsetY: number;
    /** Callback ao clicar para abrir painel de avaliação */
    onClick: () => void;
    /** Se o FAB deve pulsar (quando não interagido) */
    pulse?: boolean;
}

/**
 * Botão flutuante (FAB) para abrir o painel de Avaliação Humana.
 *
 * Posiciona-se ao lado do campo ativo no editor de texto,
 * acompanhando visualmente a seção que pode ser avaliada.
 */
export default function EvaluationFAB({
    visible,
    offsetY,
    onClick,
    pulse = true,
}: EvaluationFABProps) {
    if (!visible) return null;

    return (
        <button
            type="button"
            className={`evaluation-fab ${pulse ? 'evaluation-fab__pulse' : ''}`}
            style={{ top: `${Math.max(0, offsetY)}px` }}
            onClick={onClick}
            aria-label="Avaliar esta seção"
            title="Avaliar esta seção"
            id="btn-evaluation-fab"
        >
            <ClipboardCheck size={22} />
            <span className="evaluation-fab__tooltip">Avaliar esta seção</span>
        </button>
    );
}
