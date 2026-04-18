/**
 * Dados de entrada do formulário (enviados ao backend)
 */
export interface DemandaInput {
    pca: string;
    demanda_unidade: string;
    grau_prioridade: string;
    justificativa: string;
    valor_estimado: string;
    modelo: string;
    data_prevista: string;
    investimento_custeio: string;
}

/**
 * Estrutura do planejamento estratégico retornado pela API
 */
export interface PlanejamentoEstrategico {
    plano_gestao: string[];
    plano_anual_contratacoes: string[];
    pdtic: string[];
    entic_jud: string[];
}

/**
 * Resposta completa da API com sugestões para o DOD
 */
export interface DODResponse {
    nome_projeto: string[];
    data_envio: string[];
    identificacao_pca: string[];
    alinhamento_loa: string[];
    fonte_recurso: string[];
    motivacao_justificativa: string[];
    resultados_beneficios: string[];
    planejamento_estrategico: PlanejamentoEstrategico;
}

/**
 * Novo contrato de resposta da API /recommend_dod (com persistência de trace)
 */
export interface DODApiResponse {
    trace_id: string;
    texto_gerado: DODResponse;
}

/**
 * Payload para POST /evaluation/evaluate
 */
export interface DocumentEvaluationPayload {
    trace_id: string;
    section_name: string;
    document_type: 'DOD' | 'ETP' | 'TR';
    evaluator_id: string;
    is_context_relevant: 0 | 1;
    is_answer_faithful: 0 | 1;
    is_answer_relevant: 0 | 1;
    score_strategic_alignment: 1 | 2 | 3 | 4 | 5;
    score_clarity: 1 | 2 | 3 | 4 | 5;
    expert_comments: string;
}

/**
 * Estado interno do formulário de avaliação humana (ARES)
 */
export interface EvaluationFormData {
    is_context_relevant: 0 | 1 | null;
    is_answer_faithful: 0 | 1 | null;
    is_answer_relevant: 0 | 1 | null;
    score_strategic_alignment: number;
    score_clarity: number;
    expert_comments: string;
}

/**
 * Corpo de entrada para a requisição do ETP
 * Combina os dados do formulário base (DemandaInput) com os campos do DOD editados
 */
export interface ETPInput extends DemandaInput {
    nome_projeto: string[];
    data_envio: string[];
    identificacao_pca: string[];
    alinhamento_loa: string[];
    motivacao_justificativa: string[];
    resultados_beneficios: string[];
    planejamento_estrategico: PlanejamentoEstrategico;
}

/**
 * Sub-estrutura para Requisitos de Padrões e Modelos de Interoperabilidade
 */
export interface RequisitosInteroperabilidade {
    resp_mni: string[];
    resp_icp_brasil: string[];
    resp_moreq_jus: string[];
}

/**
 * Sub-estrutura para Avaliação das diferentes soluções
 */
export interface AvaliacaoAlternativa {
    resp_descricao: string[];
}

export interface AvaliacaoDiferentesSolucoes {
    resp_periodo_analisado: string[];
    resp_termos_analisados: string[];
    resp_metodologia_de_calculo: string[];
    resp_alternativa_1: AvaliacaoAlternativa;
    resp_alternativa_2: AvaliacaoAlternativa;
    resp_alternativa_3: AvaliacaoAlternativa;
    resp_alternativa_4: AvaliacaoAlternativa;
    resp_alternativa_5: AvaliacaoAlternativa;
}

/**
 * Sub-estrutura para Justificativa de escolha da Solução
 */
export interface JustificativaEscolhaSolucao {
    resp_motivacao_justificativa_escolha: string[];
}

export interface ItemFormaCalculo {
    item: string;
    estimativa_qtd: string;
    forma_estimativa: string;
}

export interface ItemObjetoTR {
    item: string;
    objeto: string;
    quantidade: string;
    metrica: string;
    unidade: string;
}

/**
 * Sub-estrutura para Relação Demanda Prevista e Quantidade
 */
export interface RelacaoDemandaPrevista {
    resp_relacao_necessidade_volumes: string[];
    resp_forma_calculo_quantitativo: ItemFormaCalculo[];
    resp_natureza_objeto: string[];
    resp_modalidade_tipo_licitacao: string[];
    resp_parcelamento_objeto: string[];
    resp_vigencia_contrato: string[];
}

/**
 * Sub-estrutura para Necessidades de Adequação do Ambiente
 */
export interface NecessidadesAdequacao {
    resp_infraestrutura_tecnologica: string[];
    resp_infraestrutura_eletrica: string[];
    resp_logistica_implantacao: string[];
    resp_espaco_fisico: string[];
    resp_mobiliario: string[];
}

/**
 * Resposta completa da API com sugestões para o ETP
 */
export interface RecursosHumanos {
    resp_aspecto: string;
    resp_necessidades: string[];
    resp_responsavel: string[];
    resp_prazo_atendimento: string[];
}

export interface ETPResponse {
    resp_descricao_solucao: string[];
    resp_potenciais_usuarios: string[];
    resp_requisitos_tecnologicos: string[];
    resp_requisitos_legais: string[];
    resp_requisitos_temporais: string[];
    resp_requisitos_capacitacao: string[];
    resp_requisitos_manutencao: string[];
    resp_requisitos_seguranca: string[];
    resp_requisitos_social_cultural_sustentabilidade: string[];
    resp_requisitos_niveis_servico: string[];
    resp_requisitos_qualificacao_experiencia: string[];
    resp_requisitos_formas_comunicacao: string[];
    resp_requisitos_padroes_interoperabilidade: RequisitosInteroperabilidade;
    resp_outros_requisitos: string[];
    resp_avaliacao_diferentes_solucoes_disponiveis: AvaliacaoDiferentesSolucoes;
    resp_justificativa_escola_solucao_de_ti: JustificativaEscolhaSolucao;
    resp_relacao_demanda_prevista_e_quantidade: RelacaoDemandaPrevista;
    resp_necessidades_adequacao_ambiente: NecessidadesAdequacao;
    resp_necessidade_recursos_materiais_humanos: RecursosHumanos[];
    resp_estrategia_continuidade: any[];
    resp_estrategia_independencia_tjgo: any[];
    resp_acoes_transicao: any[];
    resp_viabilidade_economica_contratacao: string[];
    resp_aprovacao_assinatura_estudo_tecnico: string[];
}

/**
 * Contrato de resposta da API /recommend_etp (com persistência de trace)
 */
export interface ETPApiResponse {
    trace_id: string;
    texto_gerado: ETPResponse;
}

/**
 * Representa a seleção do usuário para cada campo editável
 */
export interface FieldSelection {
    fieldKey: string;
    selectedIndex: number;
    customValue?: string;
    isEditing: boolean;
}

/**
 * Origem de um item de sugestão na Visão Simplificada
 * - 'ai': gerado via requisição à API (Assistente de IA)
 * - 'standard': texto padrão oriundo de doc_models/standard_texts/
 */
export type SuggestionSource = 'ai' | 'standard';

/**
 * Item de sugestão enriquecido com metadado de origem.
 * Substitui o uso de `string[]` puro no SuggestionField.
 */
export interface SuggestionItem {
    text: string;
    source: SuggestionSource;
}

/**
 * Configuração da API
 */
export interface ApiConfig {
    baseUrl: string;
    timeout: number;
    apiKey?: string;
    model: string;
    environment: 'producao' | 'homologacao';
}

/**
 * Log entry para a tela de carregamento
 */
export interface LogEntry {
    id: string;
    timestamp: Date;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

/**
 * Corpo de entrada para a requisição do TR
 * Combina os dados base com os campos do ETP
 */
export interface TRInput extends ETPInput {
    // ETP simple fields
    resp_descricao_solucao?: string[];
    resp_potenciais_usuarios?: string[];
    resp_requisitos_tecnologicos?: string[];
    resp_requisitos_legais?: string[];
    resp_requisitos_temporais?: string[];
    resp_requisitos_capacitacao?: string[];
    resp_requisitos_manutencao?: string[];
    resp_requisitos_seguranca?: string[];
    resp_requisitos_social_cultural_sustentabilidade?: string[];
    resp_requisitos_niveis_servico?: string[];
    resp_requisitos_qualificacao_experiencia?: string[];
    resp_requisitos_formas_comunicacao?: string[];
    resp_outros_requisitos?: string[];
    resp_necessidade_recursos_materiais_humanos?: any[];
    resp_estrategia_continuidade?: any[];
    resp_estrategia_independencia_tjgo?: any[];
    resp_acoes_transicao?: any[];
    resp_viabilidade_economica_contratacao?: string[];
    resp_aprovacao_assinatura_estudo_tecnico?: string[];
    // Complex ETP fields that were selected
    resp_requisitos_padroes_interoperabilidade?: any;
    resp_avaliacao_diferentes_solucoes_disponiveis?: any;
    resp_justificativa_escola_solucao_de_ti?: any;
    resp_relacao_demanda_prevista_e_quantidade?: any;
    resp_necessidades_adequacao_ambiente?: any;
}

/**
 * Resposta completa da API com sugestões para o TR
 */
export interface TRResponse {
    resp_objeto_descricao: string[];
    resp_objeto_lote: string[];
    resp_objeto_item: string[];
    resp_objeto_objeto: string[];
    resp_objeto_quantidade: string[];
    resp_objeto_unidade: string[];
    resp_justificativa: string[];
    resp_beneficios_objetivos: string[];
    resp_do_agrupamento_do_objeto: string[];
    resp_caracteristicas_especificacoes_objeto: string[];
    resp_perfil_exigido_profissionais: string[];
    resp_garantia_contratual: string[];
    resp_amostra_poc: string[];
    resp_vistoria: string[];
    resp_vigencia_local_prazo_entrega: string[];
    resp_proposta_de_precos: string[];
    resp_plano_aquisicao_contratacao_distribuicao: string[];
    resp_obrigacoes_contratada: string[];
    resp_prevenc_consciencia_combate_racismo: string[];
    resp_prevenc_enfrentamento_assedio_moral: string[];
    resp_protecao_dados: string[];
    resp_crit_sustentabilidade: string[];
    resp_reserva_cargos: string[];
    resp_obrigacoes_contratante: string[];
    resp_infracoes_sancoes_administrativas: string[];
    resp_subcontratacao: string[];
    resp_vedacao_participacao: string[];
    resp_habilitacao: string[];
    resp_habilitacao_qualificacao_economica: string[];
    resp_habilitacao_qualificacao_tecnica: string[];
    resp_forma_pagamento: string[];
    resp_valores_estimados: string[];
    resp_documentos_complementares: string[];
}

/**
 * Contrato de resposta da API /recommend_tr (com persistência de trace)
 */
export interface TRApiResponse {
    trace_id: string;
    texto_gerado: TRResponse;
}

/**
 * Tipo de contratação: fluxo completo via RAG ou fast-track via extração de PDF
 */
export type ContractMode = 'nova' | 'repetida';

/**
 * Resposta consolidada do endpoint POST /standard/extract
 * Retorna os 3 documentos de uma vez a partir de PDFs preexistentes
 */
export interface StandardExtractResponse {
    dod: DODResponse;
    etp: ETPResponse;
    tr: TRResponse;
    metadata_extracao: Record<string, any>;
}
