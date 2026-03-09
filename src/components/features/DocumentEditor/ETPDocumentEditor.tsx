import { useState, useMemo, useCallback } from 'react';
import ETPRichTextCanvas, { getETPSuggestions } from './ETPRichTextCanvas';
import SuggestionsSidebar from './SuggestionsSidebar';
import type { ETPResponse, FieldSelection } from '../../../types';
import { ETP_FIELD_LABELS } from '../../../config/constants';
import './DocumentEditor.css';

interface ETPDocumentEditorProps {
    response: ETPResponse;
    selections: Record<string, FieldSelection>;
    onSelectionChange: (fieldKey: string, partial: Partial<FieldSelection>) => void;
}

/**
 * Editor de documento ETP com Rich Text e Sidebar de sugestões.
 * Segue o mesmo padrão do DocumentEditor do DOD.
 */
export default function ETPDocumentEditor({
    response,
    selections,
    onSelectionChange,
}: ETPDocumentEditorProps) {
    const [activeField, setActiveField] = useState<string | null>(null);
    const [fieldOffsetY, setFieldOffsetY] = useState(0);
    const [hasInteracted, setHasInteracted] = useState(false);

    const handleFieldFocus = useCallback((key: string | null) => {
        setActiveField(key);
        setHasInteracted(true);
    }, []);

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

                <SuggestionsSidebar
                    fieldKey={activeField}
                    suggestions={activeSuggestions}
                    selection={activeField ? selections[activeField] : undefined}
                    onSelect={handleSelectSuggestion}
                    offsetY={fieldOffsetY}
                    hasInteracted={hasInteracted}
                    fieldLabels={ETP_FIELD_LABELS}
                />
            </div>
        </div>
    );
}
