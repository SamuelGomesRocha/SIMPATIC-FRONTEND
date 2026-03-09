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
import { getSelectedValue } from '../../../utils/helpers';
// @ts-ignore
import dodHtmlRaw from '../../../../doc_models/1. Documento de Oficializacao da Demanda (html).html?raw';

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
        // Helper to get selected value for a field
        const getVal = (key: string) => {
            let suggestions: string[] = [];
            if (key.startsWith('planejamento_estrategico.')) {
                const subKey = key.split('.')[1];
                suggestions = ((response.planejamento_estrategico as unknown) as Record<string, string[]>)[subKey] || [];
            } else {
                suggestions = ((response as unknown) as Record<string, string[]>)[key] || [];
            }
            return getSelectedValue(key, suggestions, selections);
        };

        let text = dodHtmlRaw;
        // Fix malformed classes: class="western" class="resp_..." -> class="western resp_..."
        text = text.replace(/class="([^"]+)"\s+class="([^"]+)"/g, 'class="$1 $2"');

        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        const replacements = [
            { selector: '.resp_nome_do_projeto', field: 'nome_projeto' },
            { selector: '.resp_data_envio', field: 'data_envio' },
            { selector: '.resp_identificacao_demanda', field: 'identificacao_pca' },
            { selector: '.resp_alinhamento_loa', field: 'alinhamento_loa' },
            { selector: '.resp_fonte_recurso', field: 'fonte_recurso' },
            { selector: '.resp_motivacao_justificativa', field: 'motivacao_justificativa' },
            { selector: '.resp_resultados_beneficios', field: 'resultados_beneficios' },
            { selector: '.resp_plano_gestao', field: 'planejamento_estrategico.plano_gestao' },
            { selector: '.resp_plano_anual', field: 'planejamento_estrategico.plano_anual_contratacoes' },
        ];

        replacements.forEach(rep => {
            const el = doc.querySelector(rep.selector);
            if (el) {
                el.innerHTML = getVal(rep.field);
                el.setAttribute('data-field', rep.field);
                // ensure parent td or element passes cursor events easily if possible
            }
        });

        const listItems = doc.querySelectorAll('li p, p');
        listItems.forEach(p => {
            if (p.textContent?.includes('Plano Diretor de Tecnologia da Informação e Comunicação (PDTIC):')) {
                const spans = p.querySelectorAll('span, font');
                spans.forEach(span => {
                    if (span.textContent?.includes('apresentar') && span.textContent?.includes('descrição')) {
                        span.innerHTML = getVal('planejamento_estrategico.pdtic');
                        span.setAttribute('data-field', 'planejamento_estrategico.pdtic');
                    }
                });
            }
            if (p.textContent?.includes('(ENTIC-JUD):')) {
                const spans = p.querySelectorAll('span, font');
                spans.forEach(span => {
                    if (span.textContent?.includes('apresentar') && span.textContent?.includes('descrição')) {
                        span.innerHTML = getVal('planejamento_estrategico.entic_jud');
                        span.setAttribute('data-field', 'planejamento_estrategico.entic_jud');
                    }
                });
            }
        });

        doc.querySelectorAll('script').forEach(s => s.remove());

        return `
        <div class="document-canvas-content">
            ${doc.body.innerHTML}
        </div>`;
    }, [response, selections]); // Will recount initialContent if selections mutate, but TipTap manages its own state

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
