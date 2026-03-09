import { MessageSquare, Check, User } from 'lucide-react';
import type { FieldSelection } from '../../../types';
import { DOD_FIELD_LABELS } from '../../../config/constants';

interface SuggestionsSidebarProps {
    fieldKey: string | null;
    suggestions: string[];
    selection: FieldSelection | undefined;
    onSelect: (fieldKey: string, index: number) => void;
    offsetY: number;
    hasInteracted: boolean;
    /** Mapeamento de labels a ser utilizado. Padrão: DOD_FIELD_LABELS */
    fieldLabels?: Record<string, string>;
}

export default function SuggestionsSidebar({
    fieldKey,
    suggestions,
    selection,
    onSelect,
    offsetY,
    hasInteracted,
    fieldLabels,
}: SuggestionsSidebarProps) {
    const labels = fieldLabels || DOD_FIELD_LABELS;

    // Estado inicial: nenhum clique ainda
    if (!hasInteracted) {
        return (
            <aside className="suggestions-sidebar">
                <div className="suggestion-comment">
                    <p className="suggestion-comment__text" style={{ textAlign: 'center', padding: '2rem 0', WebkitLineClamp: 'unset' }}>
                        <MessageSquare size={20} style={{ display: 'block', margin: '0 auto 0.5rem' }} />
                        Solução de apoio à tomada de decisão. Clique em um campo do documento para visualizar as sugestões da I.A.
                    </p>
                </div>
            </aside>
        );
    }

    // Clicou mas sem sugestões para o campo
    if (!fieldKey || suggestions.length === 0) {
        return (
            <aside className="suggestions-sidebar" style={fieldKey ? { marginTop: `${Math.max(0, offsetY - 16)}px` } : undefined}>
                <div className="suggestion-comment">
                    <p className="suggestion-comment__text" style={{ WebkitLineClamp: 'unset' }}>
                        Ainda não possuímos sugestões para esse tópico. Experimente obter sugestões em:
                    </p>
                    <ol style={{ margin: '0.75rem 0 0 1.25rem', padding: 0, fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)', lineHeight: 1.8 }}>
                        {Object.entries(labels).map(([, label], idx) => (
                            <li key={idx}>{label}</li>
                        ))}
                    </ol>
                </div>
            </aside>
        );
    }

    const label = labels[fieldKey] || fieldKey;

    return (
        <aside className="suggestions-sidebar" style={{ marginTop: `${Math.max(0, offsetY - 16)}px` }}>
            <div className="suggestions-sidebar__label">
                <MessageSquare size={16} style={{ marginRight: 8 }} />
                Sugestões para: <strong>{label}</strong>
            </div>

            {suggestions.map((text, index) => (
                <div
                    key={index}
                    className={`suggestion-comment ${selection?.selectedIndex === index && !selection?.isEditing
                        ? 'suggestion-comment--active'
                        : ''
                        }`}
                    onClick={() => onSelect(fieldKey, index)}
                >
                    <div className="suggestion-comment__header">
                        <span> <User size={12} /> Assistente I.A.</span>
                        <span>Sugestão {index + 1}</span>
                    </div>
                    <p className="suggestion-comment__text">{text}</p>
                    <div className="suggestion-comment__actions">
                        <button className="btn btn--primary btn--xs">
                            <Check size={12} /> Usar esta sugestão
                        </button>
                    </div>
                </div>
            ))
            }
        </aside>
    );
}
