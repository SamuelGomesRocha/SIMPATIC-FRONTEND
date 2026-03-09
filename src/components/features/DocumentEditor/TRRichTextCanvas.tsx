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
import { getSelectedValue } from '../../../utils/helpers';
// @ts-ignore
import trHtmlRaw from '../../../../doc_models/4. Termo de Referencia.html?raw';

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
 * Lista de campos do TR Baseados nas classes do HTML
 */
const TR_SIMPLE_FIELDS = [
    { selector: '.resp_objeto_descricao', field: 'resp_objeto_descricao' },
    { selector: '.resp_objeto_lote', field: 'resp_objeto_lote' },
    { selector: '.resp_objeto_item', field: 'resp_objeto_item' },
    { selector: '.resp_objeto_objeto', field: 'resp_objeto_objeto' },
    { selector: '.resp_objeto_quantidade', field: 'resp_objeto_quantidade' },
    { selector: '.resp_objeto_unidade', field: 'resp_objeto_unidade' },
    { selector: '.resp_justificativa', field: 'resp_justificativa' },
    { selector: '.resp_beneficios_objetivos', field: 'resp_beneficios_objetivos' },
    { selector: '.resp_do_agrupamento_do_objeto', field: 'resp_do_agrupamento_do_objeto' },
    { selector: '.resp_caracteristicas_especificacoes_objeto', field: 'resp_caracteristicas_especificacoes_objeto' },
    { selector: '.resp_vigencia_local_prazo_entrega', field: 'resp_vigencia_local_prazo_entrega' },
    { selector: '.resp_proposta_de_precos', field: 'resp_proposta_de_precos' },
    { selector: '.resp_plano_aquisicao_contratacao_distribuicao', field: 'resp_plano_aquisicao_contratacao_distribuicao' },
    { selector: '.resp_obrigacoes_contratada', field: 'resp_obrigacoes_contratada' },
    { selector: '.resp_prevenc_consciencia_combate_racismo', field: 'resp_prevenc_consciencia_combate_racismo' },
    { selector: '.resp_prevenc_enfrentamento_assedio_moral', field: 'resp_prevenc_enfrentamento_assedio_moral' },
    { selector: '.resp_protecao_dados', field: 'resp_protecao_dados' },
    { selector: '.resp_crit_sustentabilidade', field: 'resp_crit_sustentabilidade' },
    { selector: '.resp_reserva_cargos', field: 'resp_reserva_cargos' },
    { selector: '.resp_obrigacoes_contratante', field: 'resp_obrigacoes_contratante' },
    { selector: '.resp_infracoes_sancoes_administrativas', field: 'resp_infracoes_sancoes_administrativas' },
    { selector: '.resp_subcontratacao', field: 'resp_subcontratacao' },
    { selector: '.resp_vedacao_participacao', field: 'resp_vedacao_participacao' },
    { selector: '.resp_habilitacao', field: 'resp_habilitacao' },
    { selector: '.resp_habilitacao_qualificacao_economica', field: 'resp_habilitacao_qualificacao_economica' },
    { selector: '.resp_habilitacao_qualificacao_tecnica', field: 'resp_habilitacao_qualificacao_tecnica' },
    { selector: '.resp_forma_pagamento', field: 'resp_forma_pagamento' },
    { selector: '.resp_valores_estimados', field: 'resp_valores_estimados' },
    { selector: '.resp_documentos_complementares', field: 'resp_documentos_complementares' }
];

/**
 * Resolve as sugestões de um campo do TR.
 * Nesse caso, todos são arrays no nível raiz da resposta.
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
        const getVal = (key: string) => {
            const suggestions = getTRSuggestions(response, key);
            return getSelectedValue(key, suggestions, selections);
        };

        let text = trHtmlRaw;
        // Correção de classes malformadas caso existam no arquivo original
        text = text.replace(/class="([^"]+)"\s+class="([^"]+)"/g, 'class="$1 $2"');

        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        TR_SIMPLE_FIELDS.forEach(rep => {
            const elements = doc.querySelectorAll(rep.selector);

            elements.forEach(el => {
                const value = getVal(rep.field);
                if (value) {
                    // Se for linha de tabela, geralmente coloca-se o valor na coluna de valor 
                    // Mas verificaremos genericamente.
                    const tds = el.querySelectorAll('td');
                    if (tds.length >= 2) {
                        tds[1].innerHTML = value;
                        tds[1].setAttribute('data-field', rep.field);
                    } else if (el.tagName === 'P' || el.tagName === 'DIV') {
                        // Injeta o conteúdo real além da estrutura bold/strong de título
                        // Se houver texto forte, preservamos e concatenamos, caso contrário sobrescrevemos
                        const boldText = el.querySelector('b, strong');
                        if (boldText) {
                            el.innerHTML = boldText.outerHTML + " " + value;
                        } else {
                            // Se for classe descritiva ou texto direto
                            el.innerHTML = value;
                        }
                        el.setAttribute('data-field', rep.field);
                    } else {
                        el.innerHTML = value;
                        el.setAttribute('data-field', rep.field);
                    }
                } else {
                    // Sem valor selecionado, apenas marca para permitir clique / foco
                    const tds = el.querySelectorAll('td');
                    if (tds.length >= 2) {
                        tds[1].setAttribute('data-field', rep.field);
                    } else {
                        el.setAttribute('data-field', rep.field);
                    }
                }
            });
        });

        doc.querySelectorAll('script').forEach(s => s.remove());

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
