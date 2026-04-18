/**
 * Mapeamento de textos padrão (standard_texts) para campos da Visão Simplificada.
 *
 * Este módulo isola a lógica de resolução de textos padrão oriundos do diretório
 * `doc_models/standard_texts/`, permitindo que cada tipo de documento (ETP, DOD, TR)
 * tenha seu próprio mapeamento sem acoplar a lógica nos componentes de UI.
 *
 * Para adicionar novos textos padrão:
 *   1. Insira a chave e o texto no arquivo JSON correspondente (ex: etp.json)
 *   2. Adicione a entrada no mapeamento abaixo (ex: ETP_JSON_TO_RESP)
 */

// @ts-ignore — JSON import
import etpStandardTexts from '../../doc_models/standard_texts/etp.json';
// @ts-ignore — JSON import
import dodStandardTexts from '../../doc_models/standard_texts/dod.json';
// @ts-ignore — JSON import
import trStandardTexts from '../../doc_models/standard_texts/tr.json';

/**
 * Converte valores do JSON para string, lidando com objetos complexos
 */
function formatStandardText(value: any): string | null {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        // Converte objeto em string formatada (ex: para perfis profissionais ou tabelas)
        return Object.entries(value)
            .map(([key, val]) => `${key.replace(/_/g, ' ')}: ${val}`)
            .join('\n');
    }
    return String(value);
}

// ---------------------------------------------------------------------------
// ETP: mapeamento chave do JSON → campo resp_ do front-end
// ---------------------------------------------------------------------------

const ETP_JSON_TO_RESP: Record<string, string> = {
    '1_2_Potenciais_usuarios_unidades_e_gestores_da_Solucao_de_TI': 'resp_potenciais_usuarios',
    '1_2_Requisitos_Legais': 'resp_requisitos_legais',
    '1_2_Requisitos_Temporais': 'resp_requisitos_temporais',
    '1_2_Requisitos_de_Seguranca': 'resp_requisitos_seguranca',
    '1_2_Requisitos_Social_Cultural_e_de_Sustentabilidade_Ambiental': 'resp_requisitos_social_cultural_sustentabilidade',
    '1_2_Requisitos_de_Qualificacao_e_Experiencia_da_Empresa_Contratada': 'resp_requisitos_qualificacao_experiencia',
    '1_2_Requisitos_de_Formas_de_Comunicacao': 'resp_requisitos_formas_comunicacao',
    '1_2_Requisitos_de_Padroes_e_Modelos_de_Interoperabilidade': 'resp_padroes_interoperabilidade',
    '1_3_Periodo_Analisado': 'resp_periodo_analisado',
    '1_3_Metodologia_Calculo': 'resp_metodologia_de_calculo',
    '1_5_1_modalidade': 'resp_modalidade',
    '1_6_Espaco_Fisico': 'resp_espaco_fisico',
    '1_10_Acoes_Transicao_Contratual': 'resp_acoes_transicao_contratual',
};

export const ETP_STANDARD_TEXT_MAP: Record<string, string> = {};
for (const [jsonKey, respKey] of Object.entries(ETP_JSON_TO_RESP)) {
    const text = formatStandardText((etpStandardTexts as any)[jsonKey]);
    if (text) ETP_STANDARD_TEXT_MAP[respKey] = text;
}

export function getETPStandardText(fieldKey: string): string | null {
    return ETP_STANDARD_TEXT_MAP[fieldKey] ?? null;
}

// ---------------------------------------------------------------------------
// DOD: mapeamento chave do JSON → campo do front-end
// ---------------------------------------------------------------------------

const DOD_JSON_TO_FIELD: Record<string, string> = {
    '8_Alinhamento_Estrategico': 'planejamento_estrategico',
};

export const DOD_STANDARD_TEXT_MAP: Record<string, string> = {};
for (const [jsonKey, fieldKey] of Object.entries(DOD_JSON_TO_FIELD)) {
    const text = formatStandardText((dodStandardTexts as any)[jsonKey]);
    if (text) DOD_STANDARD_TEXT_MAP[fieldKey] = text;
}

export function getDODStandardText(fieldKey: string): string | null {
    return DOD_STANDARD_TEXT_MAP[fieldKey] ?? null;
}

// ---------------------------------------------------------------------------
// TR: mapeamento chave do JSON → campo resp_ do front-end
// ---------------------------------------------------------------------------

const TR_JSON_TO_RESP: Record<string, string> = {
    '5_CARACTERISTICAS_E_ESPECIFICACOES_DO_OBJETO': 'resp_caracteristicas_especificacoes_objeto',
    '5_1_PERFIL_EXIGIDO_DOS_PROFISSIONAIS': 'resp_perfil_exigido_profissionais',
    '5_2_DA_GARANTIA_CONTRATUAL': 'resp_garantia_contratual',
    '5_3_DA_APRESENTACAO_DE_AMOSTRA_OU_REALIZACAO_DE_PROVA_DE_CONCEITO': 'resp_amostra_poc',
    '7_PROPOSTA_DE_PRECOS': 'resp_proposta_de_precos',
    '9_VISTORIA': 'resp_vistoria',
    '10_DAS_OBRIGACOES_DA_CONTRATADA': 'resp_obrigacoes_contratada',
    '14_DA_VEDACAO_DA_PARTICIPACAO_DE_PESSOA_JURIDICA_EM_CONSORCIO': 'resp_vedacao_participacao',
};

export const TR_STANDARD_TEXT_MAP: Record<string, string> = {};
for (const [jsonKey, respKey] of Object.entries(TR_JSON_TO_RESP)) {
    const text = formatStandardText((trStandardTexts as any)[jsonKey]);
    if (text) TR_STANDARD_TEXT_MAP[respKey] = text;
}

export function getTRStandardText(fieldKey: string): string | null {
    return TR_STANDARD_TEXT_MAP[fieldKey] ?? null;
}
