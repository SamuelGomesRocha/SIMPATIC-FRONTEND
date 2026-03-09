import { useState, useMemo, useCallback } from 'react';
import RichTextCanvas from './RichTextCanvas';
import SuggestionsSidebar from './SuggestionsSidebar';
import type { DODResponse, FieldSelection } from '../../../types';
import './DocumentEditor.css';

interface DocumentEditorProps {
    response: DODResponse;
    selections: Record<string, FieldSelection>;
    onSelectionChange: (fieldKey: string, partial: Partial<FieldSelection>) => void;
}

export default function DocumentEditor({
    response,
    selections,
    onSelectionChange,
}: DocumentEditorProps) {
    const [activeField, setActiveField] = useState<string | null>(null);
    const [fieldOffsetY, setFieldOffsetY] = useState(0);
    const [hasInteracted, setHasInteracted] = useState(false);

    const handleFieldFocus = useCallback((key: string | null) => {
        setActiveField(key);
        setHasInteracted(true);
    }, []);

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

                <SuggestionsSidebar
                    fieldKey={activeField}
                    suggestions={activeSuggestions}
                    selection={activeField ? selections[activeField] : undefined}
                    onSelect={handleSelectSuggestion}
                    offsetY={fieldOffsetY}
                    hasInteracted={hasInteracted}
                />
            </div>
        </div>
    );
}
