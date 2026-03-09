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
import { getSelectedValue } from '../../../utils/helpers';
// @ts-ignore
import etpHtmlRaw from '../../../../doc_models/2. Estudo Tecnico Preliminar.html?raw';

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
 * Lista de campos simples do ETP (cujas sugestões são arrays de strings no nível raiz)
 */
const ETP_SIMPLE_FIELDS = [
    { selector: '.resp_descricao_solucao', field: 'resp_descricao_solucao' },
    { selector: '.resp_potenciais_usuarios', field: 'resp_potenciais_usuarios' },
    { selector: '.resp_requisitos_tecnologicos', field: 'resp_requisitos_tecnologicos' },
    { selector: '.resp_requisitos_legais', field: 'resp_requisitos_legais' },
    { selector: '.resp_requisitos_temporais', field: 'resp_requisitos_temporais' },
    { selector: '.resp_requisitos_capacitacao', field: 'resp_requisitos_capacitacao' },
    { selector: '.resp_requisitos_manutencao', field: 'resp_requisitos_manutencao' },
    { selector: '.resp_requisitos_seguranca', field: 'resp_requisitos_seguranca' },
    { selector: '.resp_requisitos_social_cultural_sustentabilidade', field: 'resp_requisitos_social_cultural_sustentabilidade' },
    { selector: '.resp_requisitos_niveis_servico', field: 'resp_requisitos_niveis_servico' },
    { selector: '.resp_requisitos_qualificacao_experiencia', field: 'resp_requisitos_qualificacao_experiencia' },
    { selector: '.resp_requisitos_formas_comunicacao', field: 'resp_requisitos_formas_comunicacao' },
    { selector: '.resp_requisitos_padroes_interoperabilidade', field: 'resp_requisitos_padroes_interoperabilidade' },
    { selector: '.resp_outros_requisitos', field: 'resp_outros_requisitos' },
    { selector: '.resp_avaliacao_diferentes_solucoes_disponiveis_no_mercado_que_atendam_aos_requisitos_do_projeto_levantamento_das_alternativas', field: 'resp_avaliacao_diferentes_solucoes_disponiveis' },
    { selector: '.resp_periodo_analisado', field: 'resp_periodo_analisado' },
    { selector: '.resp_termos_analisados', field: 'resp_termos_analisados' },
    { selector: '.resp_metodologia_de_calculo', field: 'resp_metodologia_de_calculo' },
    { selector: '.resp_alternativa_1', field: 'resp_alternativa_1' },
    { selector: '.resp_alternativa_2', field: 'resp_alternativa_2' },
    { selector: '.resp_alternativa_3', field: 'resp_alternativa_3' },
    { selector: '.resp_alternativa_4', field: 'resp_alternativa_4' },
    { selector: '.resp_alternativa_5', field: 'resp_alternativa_5' },
    { selector: '.resp_justificativa_escola_solucao_de_ti', field: 'resp_justificativa_escola_solucao_de_ti' },
    { selector: '.resp_relacao_demanda_prevista_e_quantidade', field: 'resp_relacao_demanda_prevista_e_quantidade' },
    { selector: '.resp_necessidades_adequacao_ambiente', field: 'resp_necessidades_adequacao_ambiente' },
    { selector: '.resp_relacao_necessidade_volumes', field: 'resp_relacao_necessidade_volumes' },
    { selector: '.resp_forma_calculo_quantitativo', field: 'resp_forma_calculo_quantitativo' },
    { selector: '.resp_natureza_objeto', field: 'resp_natureza_objeto' },
    { selector: '.resp_modalidade_tipo_licitacao', field: 'resp_modalidade_tipo_licitacao' },
    { selector: '.resp_parcelamento_objeto', field: 'resp_parcelamento_objeto' },
    { selector: '.resp_vigencia_contrato', field: 'resp_vigencia_contrato' },
    { selector: '.resp_acoes_transicao', field: 'resp_acoes_transicao' },
    { selector: '.resp_parcelas_fornecimento', field: 'resp_parcelas_fornecimento' },
    { selector: '.resp_quantitativo_bens_servicos', field: 'resp_quantitativo_bens_servicos' },
    { selector: '.resp_motivacao_justificativa_escolha', field: 'resp_motivacao_justificativa_escolha' },
    { selector: '.resp_necessidade_recursos_materiais_humanos', field: 'resp_necessidade_recursos_materiais_humanos' },
    { selector: '.resp_estrategia_continuidade', field: 'resp_estrategia_continuidade' },
    { selector: '.resp_estrategia_independencia_tjgo', field: 'resp_estrategia_independencia_tjgo' },
    { selector: '.resp_acoes_transicao', field: 'resp_acoes_transicao' },
    { selector: '.resp_viabilidade_economica_contratacao', field: 'resp_viabilidade_economica_contratacao' },
    { selector: '.resp_aprovacao_assinatura_estudo_tecnico', field: 'resp_aprovacao_assinatura_estudo_tecnico' },
];

/**
 * Resolve as sugestões de um campo, acessando sub-objetos quando necessário.
 */
function getETPSuggestions(response: ETPResponse, fieldKey: string): string[] {
    // Campos simples de nível raiz
    const directValue = (response as unknown as Record<string, unknown>)[fieldKey];
    if (Array.isArray(directValue)) {
        if (directValue.length > 0 && typeof directValue[0] === 'object') {
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
    // resp_avaliacao_diferentes_solucoes_disponiveis -> sub fields
    if (fieldKey === 'resp_periodo_analisado' || fieldKey === 'resp_termos_analisados' || fieldKey === 'resp_metodologia_de_calculo') {
        const avaliacao = response.resp_avaliacao_diferentes_solucoes_disponiveis;
        if (avaliacao) {
            return (avaliacao as unknown as Record<string, string[]>)[fieldKey] || [];
        }
    }

    // Alternativas 1–5
    const altMatch = fieldKey.match(/^resp_alternativa_(\d+)$/);
    if (altMatch) {
        const avaliacao = response.resp_avaliacao_diferentes_solucoes_disponiveis;
        if (avaliacao) {
            const altObj = (avaliacao as unknown as Record<string, { resp_descricao: string[] }>)[fieldKey];
            return altObj?.resp_descricao || [];
        }
    }

    // Justificativa escolha solução sub-fields
    if (['resp_parcelas_fornecimento', 'resp_quantitativo_bens_servicos', 'resp_motivacao_justificativa_escolha'].includes(fieldKey)) {
        const justificativa = response.resp_justificativa_escola_solucao_de_ti;
        if (justificativa) {
            return (justificativa as unknown as Record<string, string[]>)[fieldKey] || [];
        }
    }

    // Relação demanda prevista sub-fields
    if (['resp_relacao_necessidade_volumes', 'resp_forma_calculo_quantitativo', 'resp_natureza_objeto', 'resp_modalidade_tipo_licitacao', 'resp_parcelamento_objeto', 'resp_vigencia_contrato'].includes(fieldKey)) {
        const relacao = response.resp_relacao_demanda_prevista_e_quantidade;
        if (relacao) {
            return (relacao as unknown as Record<string, string[]>)[fieldKey] || [];
        }
    }

    // Necessidades de adequação sub-fields
    if (['resp_infraestrutura_tecnologica', 'resp_infraestrutura_eletrica', 'resp_logistica_implantacao', 'resp_espaco_fisico', 'resp_mobiliario'].includes(fieldKey)) {
        const necessidades = response.resp_necessidades_adequacao_ambiente;
        if (necessidades) {
            return (necessidades as unknown as Record<string, string[]>)[fieldKey] || [];
        }
    }

    // Interoperabilidade sub-fields
    if (['resp_mni', 'resp_icp_brasil', 'resp_moreq_jus'].includes(fieldKey)) {
        const interop = response.resp_requisitos_padroes_interoperabilidade;
        if (interop) {
            return (interop as unknown as Record<string, string[]>)[fieldKey] || [];
        }
    }

    return [];
}

export { getETPSuggestions };

export default function ETPRichTextCanvas({
    response,
    selections,
    onFieldFocus,
    onFieldOffsetY,
    onContentChange,
}: ETPRichTextCanvasProps) {

    const initialContent = useMemo(() => {
        const getVal = (key: string) => {
            const suggestions = getETPSuggestions(response, key);
            return getSelectedValue(key, suggestions, selections);
        };

        let text = etpHtmlRaw;
        // Fix malformed classes: class="western" class="resp_..." -> class="western resp_..."
        text = text.replace(/class="([^"]+)"\s+class="([^"]+)"/g, 'class="$1 $2"');

        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        // Apply replacements for elements with class selectors
        ETP_SIMPLE_FIELDS.forEach(rep => {
            const elements = doc.querySelectorAll(rep.selector);

            elements.forEach(el => {
                // Special handling for Transition Actions Table
                if (rep.field === 'resp_acoes_transicao' && (el.tagName === 'TABLE' || el.classList.contains('resp_acoes_transicao'))) {
                    const tbody = el.querySelector('.transition-actions-body');
                    const actions = response.resp_acoes_transicao;

                    if (tbody && Array.isArray(actions)) {
                        tbody.innerHTML = ''; // Clear placeholder
                        actions.forEach((action: any, idx) => {
                            const row = doc.createElement('tr');
                            const id = (idx + 1).toString().padStart(2, '0');

                            // Get values (they might be arrays or strings based on schema)
                            const actionText = action.resp_acao || '';
                            const resp = Array.isArray(action.resp_responsavel) ? action.resp_responsavel.join(', ') : action.resp_responsavel || '';
                            const inicio = Array.isArray(action.resp_inicio) ? action.resp_inicio.join(', ') : action.resp_inicio || '';
                            const fim = Array.isArray(action.resp_fim) ? action.resp_fim.join(', ') : action.resp_fim || '';

                            row.innerHTML = `
                                <td width="5%" style="border-top: none; border-bottom: 1px solid #808080; border-left: 1px solid #808080; border-right: none; padding: 0.1cm;">
                                    <p align="center"><font face="Times New Roman, serif" size="2"><b>${id}</b></font></p>
                                </td>
                                <td width="25%" style="border-top: none; border-bottom: 1px solid #808080; border-left: 1px solid #808080; border-right: none; padding: 0.1cm;">
                                    <p class="resp_acao" align="center"><font face="Times New Roman, serif" size="2" color="#0000ff">${actionText}</font></p>
                                </td>
                                <td width="35%" style="border-top: none; border-bottom: 1px solid #808080; border-left: 1px solid #808080; border-right: none; padding: 0.1cm;">
                                    <p class="resp_responsavel" align="center"><font face="Times New Roman, serif" size="2" color="#0000ff">${resp}</font></p>
                                </td>
                                <td width="17%" style="border-top: none; border-bottom: 1px solid #808080; border-left: 1px solid #808080; border-right: none; padding: 0.1cm;">
                                    <p class="resp_inicio" align="center"><font face="Times New Roman, serif" size="2" color="#0000ff">${inicio}</font></p>
                                </td>
                                <td width="18%" style="border-top: none; border-bottom: 1px solid #808080; border-left: 1px solid #808080; border-right: 1px solid #808080; padding: 0.1cm;">
                                    <p class="resp_fim" align="center"><font face="Times New Roman, serif" size="2" color="#0000ff">${fim}</font></p>
                                </td>
                            `;
                            tbody.appendChild(row);
                        });
                        el.setAttribute('data-field', 'resp_acoes_transicao');
                    }
                    return;
                }

                if (rep.field === 'resp_necessidade_recursos_materiais_humanos') {
                    const tbody = el.querySelector('.recursos-body') || el.querySelector('tbody');
                    if (tbody && Array.isArray(response.resp_necessidade_recursos_materiais_humanos)) {
                        tbody.innerHTML = ''; // Clear existing rows

                        response.resp_necessidade_recursos_materiais_humanos.forEach((rec: any) => {
                            const row = document.createElement('tr');

                            const aspecto = rec.resp_aspecto || '';
                            const necesss = Array.isArray(rec.resp_necessidades) ? rec.resp_necessidades.join('<br/>') : rec.resp_necessidades || '';
                            const resp = Array.isArray(rec.resp_responsavel) ? rec.resp_responsavel.join('<br/>') : rec.resp_responsavel || '';
                            const prazo = Array.isArray(rec.resp_prazo_atendimento) ? rec.resp_prazo_atendimento.join('<br/>') : rec.resp_prazo_atendimento || '';

                            row.innerHTML = `
                                <td width="105" style="background: transparent; border-top: none; border-bottom: 1px solid #808080; border-left: 1px solid #808080; border-right: none; padding-top: 0cm; padding-bottom: 0.1cm; padding-left: 0.1cm; padding-right: 0cm">
                                    <p align="center"><font color="#000000"><font face="Times New Roman, serif"><font size="2" style="font-size: 10pt"><b><span style="background: transparent">${aspecto}</span></b></font></font></font></p>
                                </td>
                                <td width="237" style="background: transparent; border-top: none; border-bottom: 1px solid #808080; border-left: 1px solid #808080; border-right: none; padding-top: 0cm; padding-bottom: 0.1cm; padding-left: 0.1cm; padding-right: 0cm">
                                    <p class="resp_necessidades" align="center" style="font-style: normal; font-weight: normal"><font color="#000000"><font face="Times New Roman, serif"><font size="2" style="font-size: 10pt"><span style="background: transparent"><span style="font-variant: normal"><font color="#0000ff"><span style="text-decoration: none">${necesss}</span></font></span></span></font></font></font></p>
                                </td>
                                <td width="168" style="background: transparent; border-top: none; border-bottom: 1px solid #808080; border-left: 1px solid #808080; border-right: none; padding-top: 0cm; padding-bottom: 0.1cm; padding-left: 0.1cm; padding-right: 0cm">
                                    <p class="resp_responsavel" align="center" style="font-style: normal; font-weight: normal"><font color="#000000"><font face="Times New Roman, serif"><font size="2" style="font-size: 10pt"><span style="background: transparent"><span style="font-variant: normal"><font color="#0000ff"><span style="text-decoration: none">${resp}</span></font></span></span></font></font></font></p>
                                </td>
                                <td width="99" style="background: transparent; border-top: none; border-bottom: 1px solid #808080; border-left: 1px solid #808080; border-right: 1px solid #808080; padding-top: 0cm; padding-bottom: 0.1cm; padding-left: 0.1cm; padding-right: 0.1cm">
                                    <p class="resp_prazo_atendimento" align="center" style="font-style: normal; font-weight: normal"><font color="#000000"><font face="Times New Roman, serif"><font size="2" style="font-size: 10pt"><span style="background: transparent"><span style="font-variant: normal"><font color="#0000ff"><span style="text-decoration: none">${prazo}</span></font></span></span></font></font></font></p>
                                </td>
                            `;
                            tbody.appendChild(row);
                        });
                        el.setAttribute('data-field', 'resp_necessidade_recursos_materiais_humanos');
                    }
                    return;
                }

                if (rep.field === 'resp_estrategia_continuidade' || rep.field === 'resp_estrategia_independencia_tjgo') {
                    const selectorClass = rep.field === 'resp_estrategia_continuidade' ? '.estrategia-body' : '.independencia-body';
                    // The table is somewhat far down, so we query it relatively from the p tag
                    const strategyTable = document.querySelector(selectorClass);
                    const strategyData = response[rep.field] as any[];

                    if (strategyTable && Array.isArray(strategyData)) {
                        strategyTable.innerHTML = '';
                        strategyData.forEach((rec: any) => {
                            const row = document.createElement('tr');

                            const evento = Array.isArray(rec.resp_evento) ? rec.resp_evento.join('<br/><br/>') : rec.resp_evento || '';
                            const efeito = Array.isArray(rec.resp_efeito) ? rec.resp_efeito.join('<br/><br/>') : rec.resp_efeito || '';
                            const causas = Array.isArray(rec.resp_causas) ? rec.resp_causas.join('<br/><br/>') : rec.resp_causas || '';
                            const controles = Array.isArray(rec.resp_controles_atuais) ? rec.resp_controles_atuais.join('<br/><br/>') : rec.resp_controles_atuais || '';

                            const acoesA = Array.isArray(rec.resp_acoes_contorno) ? rec.resp_acoes_contorno.join('<br/>') : rec.resp_acoes_contorno || '';
                            const acoesC = Array.isArray(rec.resp_acao_corretiva_preventiva) ? rec.resp_acao_corretiva_preventiva.join('<br/>') : rec.resp_acao_corretiva_preventiva || '';
                            const acoesTotal = `${acoesC}<br/><br/>Contorno:<br/>${acoesA}`;

                            const resp = Array.isArray(rec.resp_responsavel) ? rec.resp_responsavel.join('<br/><br/>') : rec.resp_responsavel || '';

                            row.innerHTML = `
                                <td width="101" style="border-top: none; border-bottom: 1px solid #808080; border-left: 1px solid #808080; border-right: none; padding-top: 0cm; padding-bottom: 0.1cm; padding-left: 0.1cm; padding-right: 0cm"><p class="resp_evento" align="center" style="font-style: normal; font-weight: normal"><font color="#0000ff"><font face="Times New Roman, serif"><font size="2" style="font-size: 10pt"><span style="text-decoration: none">${evento}</span></font></font></font></p></td>
                                <td width="94" style="border-top: none; border-bottom: 1px solid #808080; border-left: 1px solid #808080; border-right: none; padding-top: 0cm; padding-bottom: 0.1cm; padding-left: 0.1cm; padding-right: 0cm"><p class="resp_efeito" align="center" style="font-style: normal; font-weight: normal"><font color="#0000ff"><font face="Times New Roman, serif"><font size="2" style="font-size: 10pt"><span style="text-decoration: none">${efeito}</span></font></font></font></p></td>
                                <td width="97" style="border-top: none; border-bottom: 1px solid #808080; border-left: 1px solid #808080; border-right: none; padding-top: 0cm; padding-bottom: 0.1cm; padding-left: 0.1cm; padding-right: 0cm"><p class="resp_causas" align="center" style="font-style: normal; font-weight: normal"><font color="#0000ff"><font face="Times New Roman, serif"><font size="2" style="font-size: 10pt"><span style="text-decoration: none">${causas}</span></font></font></font></p></td>
                                <td width="97" style="border-top: none; border-bottom: 1px solid #808080; border-left: 1px solid #808080; border-right: none; padding-top: 0cm; padding-bottom: 0.1cm; padding-left: 0.1cm; padding-right: 0cm"><p class="resp_controles_atuais" align="center" style="font-style: normal; font-weight: normal"><font color="#0000ff"><font face="Times New Roman, serif"><font size="2" style="font-size: 10pt"><span style="text-decoration: none">${controles}</span></font></font></font></p></td>
                                <td width="121" style="border-top: none; border-bottom: 1px solid #808080; border-left: 1px solid #808080; border-right: none; padding-top: 0cm; padding-bottom: 0.1cm; padding-left: 0.1cm; padding-right: 0cm"><p class="resp_acao_corretiva_preventiva" align="center" style="font-style: normal; font-weight: normal"><font color="#0000ff"><font face="Times New Roman, serif"><font size="2" style="font-size: 10pt"><span style="text-decoration: none">${acoesTotal}</span></font></font></font></p></td>
                                <td width="82" style="border-top: none; border-bottom: 1px solid #808080; border-left: 1px solid #808080; border-right: 1px solid #808080; padding-top: 0cm; padding-bottom: 0.1cm; padding-left: 0.1cm; padding-right: 0.1cm"><p class="resp_responsavel" align="center" style="font-style: normal; font-weight: normal"><font color="#0000ff"><font face="Times New Roman, serif"><font size="2" style="font-size: 10pt"><span style="text-decoration: none">${resp}</span></font></font></font></p></td>
                            `;
                            strategyTable.appendChild(row);
                        });
                        el.setAttribute('data-field', rep.field);
                    }
                    return;
                }

                const value = getVal(rep.field);
                if (value) {
                    // For elements that are table rows, put the value in the second cell (value cell)
                    const tds = el.querySelectorAll('td');
                    if (tds.length >= 2) {
                        tds[1].innerHTML = value;
                        tds[1].setAttribute('data-field', rep.field);
                    } else if (el.tagName === 'P' || el.tagName === 'DIV') {
                        // For paragraph-level fields, keep the title but append the value
                        const boldText = el.querySelector('b, strong');
                        if (boldText) {
                            // Keep the title, add value after it
                            el.innerHTML = boldText.outerHTML + " " + value;
                        } else {
                            // If no bold text, replace entire content
                            el.innerHTML = value;
                        }
                        el.setAttribute('data-field', rep.field);
                    } else {
                        el.innerHTML = value;
                        el.setAttribute('data-field', rep.field);
                    }
                } else {
                    // Still mark the field for interaction
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
