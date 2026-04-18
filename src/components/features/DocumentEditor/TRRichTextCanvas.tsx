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
import type { TRResponse, FieldSelection } from '../../../types';
import { generatePopulatedHtml } from '../../../utils/exportService';

interface TRRichTextCanvasProps {
    response: TRResponse;
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

/**
 * Resolve as sugestões de um campo do TR.
 * Restaurado para uso pelo TRDocumentEditor (Sidebar).
 */
export function getTRSuggestions(response: TRResponse, fieldKey: string): string[] {
    const directValue = (response as unknown as Record<string, unknown>)[fieldKey];
    if (Array.isArray(directValue)) {
        return directValue as string[];
    }
    return [];
}

export default function TRRichTextCanvas({
    response,
    selections,
    onFieldFocus,
    onFieldOffsetY,
    onContentChange,
}: TRRichTextCanvasProps) {

    const initialContent = useMemo(() => {
        const html = generatePopulatedHtml('TR', response, selections);
        
        // Adicionar tags data-field que o editor usa para tracking
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const TR_SIMPLE_FIELDS = [
            'resp_objeto_descricao', 'resp_justificativa', 'resp_beneficios_objetivos',
            'resp_do_agrupamento_do_objeto', 'resp_caracteristicas_especificacoes_objeto',
            'resp_perfil_exigido_profissionais', 'resp_garantia_contratual', 'resp_amostra_poc',
            'resp_vistoria', 'resp_vigencia_local_prazo_entrega', 'resp_proposta_de_precos',
            'resp_plano_aquisicao_contratacao_distribuicao', 'resp_obrigacoes_contratada',
            'resp_prevenc_consciencia_combate_racismo', 'resp_prevenc_enfrentamento_assedio_moral',
            'resp_protecao_dados', 'resp_crit_sustentabilidade', 'resp_reserva_cargos',
            'resp_obrigacoes_contratante', 'resp_infracoes_sancoes_administrativas',
            'resp_subcontratacao', 'resp_vedacao_participacao', 'resp_habilitacao',
            'resp_habilitacao_qualificacao_economica', 'resp_habilitacao_qualificacao_tecnica',
            'resp_forma_pagamento', 'resp_valores_estimados', 'resp_documentos_complementares'
        ];

        TR_SIMPLE_FIELDS.forEach(field => {
            const el = doc.querySelector(`.resp_${field}`);
            if (el) el.setAttribute('data-field', field);
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
            const { from } = editor.state.selection;
            const node = editor.view.domAtPos(from).node;

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

    useEffect(() => {
        if (editor && !isFirstRender.current) {
            const currentHTML = editor.getHTML();
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
