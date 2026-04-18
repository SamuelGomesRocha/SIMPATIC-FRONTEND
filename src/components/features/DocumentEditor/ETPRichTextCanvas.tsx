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
import type { ETPResponse, FieldSelection } from '../../../types';
import { generatePopulatedHtml } from '../../../utils/exportService';

interface ETPRichTextCanvasProps {
    response: ETPResponse;
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
 * Resolve as sugestões de um campo do ETP, acessando sub-objetos quando necessário.
 * Restaurado para uso pelo ETPDocumentEditor (Sidebar).
 */
export function getETPSuggestions(response: ETPResponse, fieldKey: string): string[] {
    // Campos simples de nível raiz
    const directValue = (response as unknown as Record<string, unknown>)[fieldKey];
    if (Array.isArray(directValue)) {
        if (directValue.length > 0 && typeof directValue[0] === 'object') {
            // Formatação especial para sugestões complexas na sidebar
            if (fieldKey === 'resp_acoes_transicao') {
                const optionStr = directValue.map((a: any, i: number) => {
                    const resp = Array.isArray(a.resp_responsavel) ? a.resp_responsavel.join(', ') : a.resp_responsavel;
                    return `${i + 1}. Ação: ${a.resp_acao}\nResponsável: ${resp}`;
                }).join('\n\n');
                return [optionStr];
            } else if (fieldKey === 'resp_necessidade_recursos_materiais_humanos') {
                const optionStr = directValue.map((a: any, i: number) => {
                    const necesss = Array.isArray(a.resp_necessidades) ? a.resp_necessidades.join(' / ') : a.resp_necessidades;
                    const resp = Array.isArray(a.resp_responsavel) ? a.resp_responsavel.join(', ') : a.resp_responsavel;
                    return `${i + 1}. ${a.resp_aspecto}\nNecessidades: ${necesss}\nResponsável: ${resp}`;
                }).join('\n\n');
                return [optionStr];
            } else if (fieldKey === 'resp_estrategia_continuidade' || fieldKey === 'resp_estrategia_independencia_tjgo') {
                const optionStr = directValue.map((a: any, i: number) => {
                    const evento = Array.isArray(a.resp_evento) ? a.resp_evento.join(' / ') : a.resp_evento;
                    const acao = Array.isArray(a.resp_acao_corretiva_preventiva) ? a.resp_acao_corretiva_preventiva.join(' / ') : a.resp_acao_corretiva_preventiva;
                    return `${i + 1}. Evento: ${evento}\nAção recomendada: ${acao}`;
                }).join('\n\n');
                return [optionStr];
            }
            return ['[Tabela / Dados Complexos]'];
        }
        return directValue as string[];
    }

    // Campos aninhados em sub-objetos
    if (fieldKey.includes('.')) {
        const [parent, child] = fieldKey.split('.');
        return (response[parent as keyof ETPResponse] as any)?.[child] || [];
    }

    // Caso específico para chaves que mapeiam para o levantamento de alternativas
    if (fieldKey.startsWith('resp_alternativa_')) {
        const avaliacao = response.resp_avaliacao_diferentes_solucoes_disponiveis;
        if (avaliacao) {
            const altObj = (avaliacao as unknown as Record<string, { resp_descricao: string[] }>)[fieldKey];
            return altObj?.resp_descricao || [];
        }
    }

    return [];
}

export default function ETPRichTextCanvas({
    response,
    selections,
    onFieldFocus,
    onFieldOffsetY,
    onContentChange,
}: ETPRichTextCanvasProps) {

    const initialContent = useMemo(() => {
        const html = generatePopulatedHtml('ETP', response, selections);
        
        // Adicionar tags data-field que o editor usa para tracking
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Mapear campos simples
        const ETP_SIMPLE_FIELDS = [
            'resp_descricao_solucao', 'resp_potenciais_usuarios', 'resp_requisitos_tecnologicos',
            'resp_requisitos_legais', 'resp_requisitos_temporais', 'resp_requisitos_capacitacao',
            'resp_requisitos_manutencao', 'resp_requisitos_seguranca', 'resp_requisitos_social_cultural_sustentabilidade',
            'resp_requisitos_niveis_servico', 'resp_requisitos_qualificacao_experiencia', 'resp_requisitos_formas_comunicacao',
            'resp_padroes_interoperabilidade', 'resp_outros_requisitos', 'resp_periodo_analisado',
            'resp_termos_analisados', 'resp_metodologia_de_calculo', 'resp_alternativa_1', 'resp_alternativa_2',
            'resp_alternativa_3', 'resp_alternativa_4', 'resp_alternativa_5', 'resp_justificativa_escola_solucao_de_ti',
            'resp_relacao_demanda_prevista_e_quantidade', 'resp_necessidades_adequacao_ambiente', 'resp_relacao_necessidade_volumes',
            'resp_forma_calculo_quantitativo', 'resp_natureza_objeto', 'resp_modalidade_tipo_licitacao',
            'resp_parcelamento_objeto', 'resp_vigencia_contrato', 'resp_acoes_transicao',
            'resp_motivacao_justificativa_escolha', 'resp_necessidade_recursos_materiais_humanos',
            'resp_estrategia_continuidade', 'resp_estrategia_independencia_tjgo', 'resp_viabilidade_economica_contratacao',
            'resp_aprovacao_assinatura_estudo_tecnico'
        ];

        ETP_SIMPLE_FIELDS.forEach(field => {
            const el = doc.querySelector(`.resp_${field}`);
            if (el) el.setAttribute('data-field', field);
        });

        // Mapear campos aninhados
        const interoperability = [
            { selector: '.resp_mni', field: 'resp_requisitos_padroes_interoperabilidade.resp_mni' },
            { selector: '.resp_icp_brasil', field: 'resp_requisitos_padroes_interoperabilidade.resp_icp_brasil' },
            { selector: '.resp_moreq_jus', field: 'resp_requisitos_padroes_interoperabilidade.resp_moreq_jus' },
        ];

        interoperability.forEach(item => {
            const el = doc.querySelector(item.selector);
            if (el) el.setAttribute('data-field', item.field);
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
