import { useState } from 'react';
import { Edit3, ChevronDown, ChevronUp, ClipboardCheck, Sparkles, FileCheck } from 'lucide-react';
import type { FieldSelection, SuggestionItem } from '../../../types';
import { DOD_FIELD_DESCRIPTIONS } from '../../../config/constants';
import EvaluationPanel from '../../features/DocumentEditor/EvaluationPanel';

interface SuggestionFieldProps {
    fieldKey: string;
    label: string;
    suggestions: SuggestionItem[];
    selection: FieldSelection;
    onSelectionChange: (fieldKey: string, selection: Partial<FieldSelection>) => void;
    traceId?: string | null;
    documentType?: 'DOD' | 'ETP' | 'TR';
}

/**
 * Campo editável com sugestões da API.
 * Permite escolher entre sugestões ou editar livremente.
 */
export default function SuggestionField({
    fieldKey,
    label,
    suggestions,
    selection,
    onSelectionChange,
    traceId,
    documentType,
}: SuggestionFieldProps) {
    const [showCustom, setShowCustom] = useState(selection.isEditing);
    const [showEvaluation, setShowEvaluation] = useState(false);
    const description = DOD_FIELD_DESCRIPTIONS[fieldKey];

    const handleSelectSuggestion = (index: number) => {
        onSelectionChange(fieldKey, {
            selectedIndex: index,
            customValue: undefined,
            isEditing: false,
        });
        setShowCustom(false);
    };

    const handleCustomChange = (value: string) => {
        onSelectionChange(fieldKey, {
            customValue: value,
            isEditing: true,
        });
    };

    const toggleCustom = () => {
        const next = !showCustom;
        setShowCustom(next);
        if (!next) {
            onSelectionChange(fieldKey, {
                customValue: undefined,
                isEditing: false,
            });
        }
    };

    return (
        <div
            className="suggestion-field-wrapper"
            style={{
                display: 'flex',
                gap: '1.5rem',
                justifyContent: 'center',
                alignItems: 'flex-start',
                width: '100%',
                marginBottom: 'var(--spacing-lg)',
                transition: 'all 0.3s ease'
            }}
        >
            <div
                className="suggestion-field"
                style={{
                    flex: '0 0 50%',
                    margin: 0,
                    marginBottom: 0
                }}
            >
                <div className="suggestion-field__header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <div className="suggestion-field__label">{label}</div>
                            {description && (
                                <div className="suggestion-field__description">{description}</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="suggestion-field__body">
                    <div className="suggestion-options">
                        {suggestions.map((item, index) => (
                            <div
                                key={index}
                                className={`suggestion-option ${!showCustom && selection.selectedIndex === index
                                    ? 'suggestion-option--selected'
                                    : ''
                                    }`}
                                onClick={() => handleSelectSuggestion(index)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') handleSelectSuggestion(index);
                                }}
                                id={`suggestion-${fieldKey}-${index}`}
                            >
                                <div className="suggestion-option__radio" />
                                <span className={`suggestion-option__index suggestion-option__index--${item.source}`}>
                                    {item.source === 'ai'
                                        ? <><Sparkles size={12} /> IA</>
                                        : <><FileCheck size={12} /> Padrão</>
                                    }
                                </span>
                                <span 
                                    className="suggestion-option__text"
                                    dangerouslySetInnerHTML={{ __html: item.text }}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="custom-edit">
                        <button
                            className="custom-edit__toggle"
                            onClick={toggleCustom}
                            id={`toggle-edit-${fieldKey}`}
                        >
                            <Edit3 size={14} />
                            {showCustom ? 'Usar sugestão' : 'Editar manualmente'}
                            {showCustom ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {showCustom && (
                            <textarea
                                className="custom-edit__textarea"
                                value={selection.customValue || ''}
                                onChange={(e) => handleCustomChange(e.target.value)}
                                placeholder="Digite seu texto personalizado..."
                                id={`custom-text-${fieldKey}`}
                            />
                        )}
                    </div>

                    {traceId && documentType && (
                        <div style={{
                            marginTop: '1.5rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid var(--gray-200)',
                            display: 'flex',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                className={`btn btn--sm ${showEvaluation ? 'btn--primary' : 'btn--secondary'}`}
                                onClick={() => setShowEvaluation(!showEvaluation)}
                                title="Avaliar Resposta"
                            >
                                <ClipboardCheck size={16} />
                                {showEvaluation ? 'Avaliação Aberta' : 'Avaliar'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showEvaluation && traceId && documentType && (
                <div
                    className="evaluation-panel-wrapper"
                    style={{
                        flex: '0 0 420px',
                        maxWidth: '420px',
                        position: 'sticky',
                        top: '1rem',
                        animation: 'evalPanelSlideIn 0.3s ease'
                    }}
                >
                    <style>
                        {`
                        .evaluation-panel-wrapper .evaluation-panel {
                            width: 100% !important;
                            position: static !important;
                            margin-top: 0 !important;
                        }
                        `}
                    </style>
                    <EvaluationPanel
                        fieldKey={fieldKey}
                        traceId={traceId}
                        onClose={() => setShowEvaluation(false)}
                        offsetY={0}
                        documentType={documentType}
                    />
                </div>
            )}
        </div>
    );
}
