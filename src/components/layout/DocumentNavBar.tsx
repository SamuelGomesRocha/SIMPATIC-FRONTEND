import { CheckCircle2, Circle } from 'lucide-react';
import './DocumentNavBar.css';

export type CurrentDocument = 'DOD' | 'ETP' | 'TR';

interface DocumentNavBarProps {
    currentDoc: CurrentDocument;
    completedDocs: CurrentDocument[]; 
    loadingDocs: CurrentDocument[];
    onNavigate: (doc: CurrentDocument) => void;
}

export default function DocumentNavBar({ currentDoc, completedDocs, loadingDocs, onNavigate }: DocumentNavBarProps) {
    const steps: { label: string; id: CurrentDocument }[] = [
        { label: 'DOD', id: 'DOD' },
        { label: 'ETP', id: 'ETP' },
        { label: 'TR', id: 'TR' }
    ];

    return (
        <div className="doc-nav-bar">
            {steps.map((step, index) => {
                const isActive = currentDoc === step.id;
                const isCompleted = completedDocs.includes(step.id);
                const isLoading = loadingDocs.includes(step.id);
                
                // Clicável se estiver completo ou carregando
                const isClickable = isCompleted || isLoading;

                let btnClass = 'doc-nav-bar__step';
                if (isActive) btnClass += ' doc-nav-bar__step--active';
                if (isClickable && !isActive) btnClass += ' doc-nav-bar__step--clickable';
                if (isLoading) btnClass += ' doc-nav-bar__step--loading';

                return (
                    <div key={step.id} className="doc-nav-bar__item">
                        <button
                            className={btnClass}
                            onClick={() => isClickable && onNavigate(step.id)}
                            disabled={!isClickable && !isActive}
                            title={isLoading ? `Gerando ${step.label}...` : !isClickable ? 'Complete o passo anterior para liberar este documento' : `Ir para ${step.label}`}
                        >
                            <span className="doc-nav-bar__icon">
                                {isLoading ? (
                                    <div className="doc-nav-bar__spinner"></div>
                                ) : isCompleted ? (
                                    <CheckCircle2 size={18} />
                                ) : (
                                    <Circle size={18} />
                                )}
                            </span>
                            <span className="doc-nav-bar__label">{step.label}</span>
                        </button>

                        {index < steps.length - 1 && (
                            <div className={`doc-nav-bar__divider ${(completedDocs.includes(steps[index + 1].id) || loadingDocs.includes(steps[index + 1].id)) ? 'doc-nav-bar__divider--active' : ''}`}></div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
