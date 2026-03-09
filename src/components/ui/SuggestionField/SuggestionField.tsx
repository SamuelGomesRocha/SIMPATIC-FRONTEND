import { useState } from 'react';
import { Edit3, ChevronDown, ChevronUp } from 'lucide-react';
import type { FieldSelection } from '../../../types';
import { DOD_FIELD_DESCRIPTIONS } from '../../../config/constants';

interface SuggestionFieldProps {
    fieldKey: string;
    label: string;
    suggestions: string[];
    selection: FieldSelection;
    onSelectionChange: (fieldKey: string, selection: Partial<FieldSelection>) => void;
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
}: SuggestionFieldProps) {
    const [showCustom, setShowCustom] = useState(selection.isEditing);
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
        <div className="suggestion-field">
            <div className="suggestion-field__header">
                <div className="suggestion-field__label">{label}</div>
                {description && (
                    <div className="suggestion-field__description">{description}</div>
                )}
            </div>

            <div className="suggestion-field__body">
                <div className="suggestion-options">
                    {suggestions.map((text, index) => (
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
                            <span className="suggestion-option__index">
                                Sugestão {index + 1}
                            </span>
                            <span className="suggestion-option__text">{text}</span>
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
            </div>
        </div>
    );
}
