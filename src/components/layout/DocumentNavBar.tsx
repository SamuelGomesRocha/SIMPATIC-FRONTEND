import { CheckCircle2, Circle } from 'lucide-react';
import './DocumentNavBar.css';

export type CurrentDocument = 'DOD' | 'ETP' | 'TR';

interface DocumentNavBarProps {
    currentDoc: CurrentDocument;
    completedDocs: CurrentDocument[]; // Array de quais completaram o passo e podem ser clicados
    onNavigate: (doc: CurrentDocument) => void;
}

export default function DocumentNavBar({ currentDoc, completedDocs, onNavigate }: DocumentNavBarProps) {
    const steps: { label: string; id: CurrentDocument }[] = [
        { label: 'DOD', id: 'DOD' },
        { label: 'ETP', id: 'ETP' },
        { label: 'TR', id: 'TR' }
    ];

    return (
        <div className="doc-nav-bar">
            {steps.map((step, index) => {
                const isActive = currentDoc === step.id;
                // Uma etapa está completada/liberada se ela está na lista `completedDocs`
                // Vamos sempre permitir navegar pro DOD se pelo menos ele foi feito. ETP e TR só se a etapa anterior foi confirmada.
                const isClickable = completedDocs.includes(step.id);

                let btnClass = 'doc-nav-bar__step';
                if (isActive) btnClass += ' doc-nav-bar__step--active';
                if (isClickable && !isActive) btnClass += ' doc-nav-bar__step--clickable';

                return (
                    <div key={step.id} className="doc-nav-bar__item">
                        <button
                            className={btnClass}
                            onClick={() => isClickable && onNavigate(step.id)}
                            disabled={!isClickable && !isActive}
                            title={!isClickable ? 'Complete o passo anterior para liberar este documento' : `Ir para ${step.label}`}
                        >
                            <span className="doc-nav-bar__icon">
                                {isClickable ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                            </span>
                            <span className="doc-nav-bar__label">{step.label}</span>
                        </button>

                        {index < steps.length - 1 && (
                            <div className={`doc-nav-bar__divider ${completedDocs.includes(steps[index + 1].id) || (isActive && completedDocs.includes(steps[index + 1].id)) ? 'doc-nav-bar__divider--active' : ''}`}></div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
