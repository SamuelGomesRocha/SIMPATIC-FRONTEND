import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Underline from '@tiptap/extension-underline';
import { Extension } from '@tiptap/core';
import FontSizeExtension from './FontSizeExtension';
import EditorToolbar from './EditorToolbar';
import { useMemo, useEffect, useRef } from 'react';
import type { DODResponse, FieldSelection } from '../../../types';
// @ts-ignore
import dodHtmlRaw from '../../../../doc_models/new_html/dod/1.DocumentodeOficializacaodaDemanda.html?raw';
import { generatePopulatedHtml } from '../../../utils/exportService';

interface RichTextCanvasProps {
    response: DODResponse;
    selections: Record<string, FieldSelection>;
    onFieldFocus: (key: string | null) => void;
    onFieldOffsetY: (offsetY: number) => void;
    onContentChange: (html: string) => void;
}

const DataFieldExtension = Extension.create({
    name: 'dataField',
    addGlobalAttributes() {
        return [
            {
                types: ['textStyle', 'paragraph', 'heading', 'tableCell', 'tableHeader', 'tableRow', 'td', 'tr', 'th', 'span', 'div'],
                attributes: {
                    'data-field': {
                        default: null,
                        parseHTML: element => element.getAttribute('data-field'),
                        renderHTML: attributes => {
                            if (!attributes['data-field']) return {};
                            return { 'data-field': attributes['data-field'] };
                        },
                    },
                    style: {
                        default: null,
                        parseHTML: element => element.getAttribute('style'),
                        renderHTML: attributes => {
                            if (!attributes.style) return {};
                            return { style: attributes.style };
                        }
                    },
                    class: {
                        default: null,
                        parseHTML: element => element.getAttribute('class'),
                        renderHTML: attributes => {
                            if (!attributes.class) return {};
                            return { class: attributes.class };
                        }
                    }
                },
            },
        ]
    },
});

export default function RichTextCanvas({
    response,
    selections,
    onFieldFocus,
    onFieldOffsetY,
    onContentChange,
}: RichTextCanvasProps) {

    const initialContent = useMemo(() => {
        const html = generatePopulatedHtml('DOD', response, selections);

        // Adicionar tags data-field que o editor usa para tracking
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const fieldMapping: Record<string, string> = {
            '.resp_nome_do_projeto': 'nome_projeto',
            '.resp_data_envio': 'data_envio',
            '.resp_identificacao_demanda': 'identificacao_pca',
            '.resp_alinhamento_loa': 'alinhamento_loa',
            '.resp_fonte_recurso': 'fonte_recurso',
            '.resp_motivacao_justificativa': 'motivacao_justificativa',
            '.resp_resultados_beneficios': 'resultados_beneficios',
            '.resp_plano_gestao': 'planejamento_estrategico.plano_gestao',
            '.resp_plano_anual': 'planejamento_estrategico.plano_anual_contratacoes',
            '.resp_pdtic': 'planejamento_estrategico.pdtic',
            '.resp_entic_jud': 'planejamento_estrategico.entic_jud',
        };

        Object.entries(fieldMapping).forEach(([selector, fieldKey]) => {
            const el = doc.querySelector(selector);
            if (el) el.setAttribute('data-field', fieldKey);
        });

        return `
        <div class="document-canvas-content">
            ${doc.body.innerHTML}
        </div>`;
    }, [response, selections]);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Clique para editar...',
            }),
            Highlight,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TextStyle,
            Color,
            FontFamily,
            Underline,
            FontSizeExtension,
            DataFieldExtension,
        ],
        content: initialContent,
        onUpdate: ({ editor }) => {
            onContentChange(editor.getHTML());
        },
        onSelectionUpdate: ({ editor }) => {
            // Find the active field based on the node where the cursor is
            const { from } = editor.state.selection;
            const node = editor.view.domAtPos(from).node;

            // Traverse up to find a parent with data-field
            let current = node instanceof HTMLElement ? node : node.parentElement;
            let foundField = null;

            while (current && !current.classList.contains('document-canvas')) {
                const fieldKey = current.getAttribute('data-field');
                if (fieldKey) {
                    foundField = fieldKey;
                    break;
                }
                current = current.parentElement;
            }

            onFieldFocus(foundField);

            // Compute Y offset of found field relative to the editor body container
            if (foundField && current) {
                const editorBody = current.closest('.document-editor__body');
                if (editorBody) {
                    const bodyRect = editorBody.getBoundingClientRect();
                    const fieldRect = current.getBoundingClientRect();
                    onFieldOffsetY(fieldRect.top - bodyRect.top);
                }
            } else {
                onFieldOffsetY(0);
            }
        },
    });

    const isFirstRender = useRef(true);

    // Sync editor content when initialContent changes (e.g., suggestion selected)
    useEffect(() => {
        if (editor && !isFirstRender.current) {
            const currentHTML = editor.getHTML();
            // Only update if content is actually different to avoid cursor jumps
            if (currentHTML !== initialContent) {
                editor.commands.setContent(initialContent, { emitUpdate: false });
            }
        }
        isFirstRender.current = false;
    }, [editor, initialContent]);

    if (!editor) {
        return null;
    }

    return (
        <div className="document-canvas rich-text-canvas">
            <EditorToolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
