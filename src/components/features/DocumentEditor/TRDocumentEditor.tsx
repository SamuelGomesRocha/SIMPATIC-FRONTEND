import { useState, useMemo, useCallback } from 'react';
import TRRichTextCanvas, { getTRSuggestions } from './TRRichTextCanvas';
import SuggestionsSidebar from './SuggestionsSidebar';
import type { TRResponse, FieldSelection } from '../../../types';
import { TR_FIELD_LABELS } from '../../../config/constants';
import './DocumentEditor.css';

interface TRDocumentEditorProps {
    response: TRResponse;
    selections: Record<string, FieldSelection>;
    onSelectionChange: (fieldKey: string, partial: Partial<FieldSelection>) => void;
}

/**
 * Editor de documento TR com Rich Text e Sidebar de sugestões.
 */
export default function TRDocumentEditor({
    response,
    selections,
    onSelectionChange,
}: TRDocumentEditorProps) {
    const [activeField, setActiveField] = useState<string | null>(null);
    const [fieldOffsetY, setFieldOffsetY] = useState(0);
    const [hasInteracted, setHasInteracted] = useState(false);

    const handleFieldFocus = useCallback((key: string | null) => {
        setActiveField(key);
        setHasInteracted(true);
    }, []);

    const activeSuggestions = useMemo(() => {
        if (!activeField) return [];
        return getTRSuggestions(response, activeField);
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
                <TRRichTextCanvas
                    response={response}
                    selections={selections}
                    onFieldFocus={handleFieldFocus}
                    onFieldOffsetY={setFieldOffsetY}
                    onContentChange={(html) => {
                        console.log('TR Document updated:', html);
                    }}
                />

                <SuggestionsSidebar
                    fieldKey={activeField}
                    suggestions={activeSuggestions}
                    selection={activeField ? selections[activeField] : undefined}
                    onSelect={handleSelectSuggestion}
                    offsetY={fieldOffsetY}
                    hasInteracted={hasInteracted}
                    fieldLabels={TR_FIELD_LABELS}
                />
            </div>
        </div>
    );
}
