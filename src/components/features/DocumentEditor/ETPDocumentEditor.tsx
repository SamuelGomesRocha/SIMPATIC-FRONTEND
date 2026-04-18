import { useState, useMemo, useCallback } from 'react';
import ETPRichTextCanvas, { getETPSuggestions } from './ETPRichTextCanvas';
import SuggestionsSidebar from './SuggestionsSidebar';
import EvaluationPanel from './EvaluationPanel';
import EvaluationFAB from './EvaluationFAB';
import type { ETPResponse, FieldSelection } from '../../../types';
import { ETP_FIELD_LABELS, EVALUABLE_ETP_SECTIONS } from '../../../config/constants';
import './DocumentEditor.css';

interface ETPDocumentEditorProps {
    response: ETPResponse;
    selections: Record<string, FieldSelection>;
    onSelectionChange: (fieldKey: string, partial: Partial<FieldSelection>) => void;
    /** trace_id da sessão de geração do ETP (habilita avaliação) */
    traceId?: string | null;
}

/**
 * Editor de documento ETP com Rich Text e Sidebar de sugestões.
 * Segue o mesmo padrão do DocumentEditor do DOD.
 */
export default function ETPDocumentEditor({
    response,
    selections,
    onSelectionChange,
    traceId = null,
}: ETPDocumentEditorProps) {
    const [activeField, setActiveField] = useState<string | null>(null);
    const [fieldOffsetY, setFieldOffsetY] = useState(0);
    const [hasInteracted, setHasInteracted] = useState(false);
    /** Controla se o painel de avaliação está aberto (substitui sugestões) */
    const [showEvaluation, setShowEvaluation] = useState(false);

    const handleFieldFocus = useCallback((key: string | null) => {
        setActiveField(key);
        setHasInteracted(true);
    }, []);

    /** Verifica se o campo ativo é avaliável */
    const isEvaluableField = activeField
        ? EVALUABLE_ETP_SECTIONS.includes(activeField)
        : false;

    const activeSuggestions = useMemo(() => {
        if (!activeField) return [];
        return getETPSuggestions(response, activeField);
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

    /** Determinar se o FAB deve ser visível */
    const showFAB = !!traceId && isEvaluableField && !showEvaluation;

    return (
        <div className="document-editor-container">
            <div className="document-editor__body">
                <ETPRichTextCanvas
                    response={response}
                    selections={selections}
                    onFieldFocus={handleFieldFocus}
                    onFieldOffsetY={setFieldOffsetY}
                    onContentChange={(html) => {
                        console.log('ETP Document updated:', html);
                    }}
                />

                <EvaluationFAB
                    visible={showFAB}
                    offsetY={fieldOffsetY}
                    onClick={handleOpenEvaluation}
                    pulse={!showEvaluation}
                />

                {showEvaluation && traceId ? (
                    <EvaluationPanel
                        fieldKey={activeField}
                        traceId={traceId}
                        onClose={handleCloseEvaluation}
                        offsetY={fieldOffsetY}
                        documentType="ETP"
                    />
                ) : (
                    <SuggestionsSidebar
                        fieldKey={activeField}
                        suggestions={activeSuggestions}
                        selection={activeField ? selections[activeField] : undefined}
                        onSelect={handleSelectSuggestion}
                        offsetY={fieldOffsetY}
                        hasInteracted={hasInteracted}
                        fieldLabels={ETP_FIELD_LABELS}
                    />
                )}
            </div>
        </div>
    );
}
