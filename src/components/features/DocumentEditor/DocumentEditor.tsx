import { useState, useMemo, useCallback } from 'react';
import RichTextCanvas from './RichTextCanvas';
import SuggestionsSidebar from './SuggestionsSidebar';
import EvaluationPanel from './EvaluationPanel';
import EvaluationFAB from './EvaluationFAB';
import type { DODResponse, FieldSelection } from '../../../types';
import { EVALUABLE_DOD_SECTIONS } from '../../../config/constants';
import './DocumentEditor.css';

interface DocumentEditorProps {
    response: DODResponse;
    selections: Record<string, FieldSelection>;
    onSelectionChange: (fieldKey: string, partial: Partial<FieldSelection>) => void;
    /** trace_id da sessão de geração do DOD (habilita avaliação) */
    traceId?: string | null;
}

export default function DocumentEditor({
    response,
    selections,
    onSelectionChange,
    traceId = null,
}: DocumentEditorProps) {
    const [activeField, setActiveField] = useState<string | null>(null);
    const [fieldOffsetY, setFieldOffsetY] = useState(0);
    const [hasInteracted, setHasInteracted] = useState(false);
    /** Controla se o painel de avaliação está aberto (substitui sugestões) */
    const [showEvaluation, setShowEvaluation] = useState(false);

    const handleFieldFocus = useCallback((key: string | null) => {
        setActiveField(key);
        setHasInteracted(true);
        // Se mudou de campo, fechar o painel de avaliação
        // para que o FAB reapareça no novo campo
    }, []);

    /** Verifica se o campo ativo é avaliável */
    const isEvaluableField = activeField
        ? EVALUABLE_DOD_SECTIONS.includes(activeField)
        : false;

    const activeSuggestions = useMemo(() => {
        if (!activeField) return [];

        // Handle nested strategy for PE
        if (activeField.startsWith('planejamento_estrategico.')) {
            const subKey = activeField.split('.')[1];
            return (response.planejamento_estrategico as unknown as Record<string, string[]>)[subKey] || [];
        }

        return (response as unknown as Record<string, string[]>)[activeField] || [];
    }, [activeField, response]);

    const handleSelectSuggestion = (fieldKey: string, index: number) => {
        onSelectionChange(fieldKey, {
            selectedIndex: index,
            customValue: undefined,
            isEditing: false,
        });
    };

    const handleOpenEvaluation = useCallback(() => {
        setShowEvaluation(true);
    }, []);

    const handleCloseEvaluation = useCallback(() => {
        setShowEvaluation(false);
    }, []);

    /** Determinar se o FAB deve ser visível:
     *  - Há traceId (sessão ativa)
     *  - Campo ativo é avaliável
     *  - Painel de avaliação NÃO está aberto
     */
    const showFAB = !!traceId && isEvaluableField && !showEvaluation;

    return (
        <div className="document-editor-container">
            <div className="document-editor__body">
                <RichTextCanvas
                    response={response}
                    selections={selections}
                    onFieldFocus={handleFieldFocus}
                    onFieldOffsetY={setFieldOffsetY}
                    onContentChange={(html) => {
                        console.log('Document updated:', html);
                        // Future: persist full HTML if needed
                    }}
                />

                {/* FAB de avaliação (visível quando campo é avaliável e painel está fechado) */}
                <EvaluationFAB
                    visible={showFAB}
                    offsetY={fieldOffsetY}
                    onClick={handleOpenEvaluation}
                    pulse={!showEvaluation}
                />

                {/* Sidebar: Avaliação (se aberta e com traceId) ou Sugestões (padrão) */}
                {showEvaluation && traceId ? (
                    <EvaluationPanel
                        fieldKey={activeField}
                        traceId={traceId}
                        onClose={handleCloseEvaluation}
                        offsetY={fieldOffsetY}
                        documentType="DOD"
                    />
                ) : (
                    <SuggestionsSidebar
                        fieldKey={activeField}
                        suggestions={activeSuggestions}
                        selection={activeField ? selections[activeField] : undefined}
                        onSelect={handleSelectSuggestion}
                        offsetY={fieldOffsetY}
                        hasInteracted={hasInteracted}
                    />
                )}
            </div>
        </div>
    );
}
