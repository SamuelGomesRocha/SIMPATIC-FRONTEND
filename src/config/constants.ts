/**
 * Constantes de configuração do sistema
 */

/** Chave do localStorage para a URL da API */
export const API_URL_STORAGE_KEY = 'dod_api_base_url';

/** Chave do localStorage para a chave de API do Gemini */
export const API_KEY_STORAGE_KEY = 'gemini_api_key';

/** Chave do localStorage para o modelo do Gemini */
export const API_MODEL_STORAGE_KEY = 'gemini_api_model';

/** Chave do localStorage para o ambiente da API (producao/homologacao) */
export const API_ENVIRONMENT_STORAGE_KEY = 'api_environment';

/** Modelo padrão do Gemini */
export const DEFAULT_API_MODEL = 'gemini-1.5-flash';

/** Ambiente padrão da API */
export const DEFAULT_API_ENVIRONMENT = 'producao';

/** URL padrão da API */
export const DEFAULT_API_URL = 'http://localhost:8000';

/** Timeout padrão da API em milissegundos */
export const DEFAULT_API_TIMEOUT = 600000;

/** Opções de Grau de Prioridade */
export const GRAU_PRIORIDADE_OPTIONS = [
    'Alta',
    'Média',
    'Baixa',
];

/** Opções de Modelo de Contratação */
export const MODELO_OPTIONS = [
    'Nova Contratação',
    'Renovação',
];

/** Opções de Investimento ou Custeio */
export const INVESTIMENTO_CUSTEIO_OPTIONS = [
    'Investimento',
    'Custeio',
];

/** Dicas sobre a Lei 14.133/2021 para tela de carregamento */
export const DICAS_LEI_14133: string[] = [
    'A Lei 14.133/2021 (Nova Lei de Licitações) substituiu a Lei 8.666/93, a Lei do Pregão (10.520/2002) e a Lei do RDC (12.462/2011).',
    'O art. 11 da Lei 14.133/2021 estabelece que o processo licitatório tem por objetivos: resultado vantajoso, tratamento isonômico, justa competição, e evitar contratações com sobrepreço ou com preços inexequíveis.',
    'A fase preparatória da licitação é considerada a mais importante pela Nova Lei de Licitações, pois é nela que se define o planejamento adequado da contratação.',
    'O Estudo Técnico Preliminar (ETP) passou a ser obrigatório na Lei 14.133/2021, conforme art. 18, §1º.',
    'A Nova Lei de Licitações prevê cinco modalidades: Pregão, Concorrência, Concurso, Leilão e Diálogo Competitivo (novidade).',
    'O art. 5º da Lei 14.133/2021 estabelece princípios como eficiência, economicidade, planejamento, transparência e sustentabilidade.',
    'A gestão de riscos é uma exigência da Lei 14.133/2021, sendo parte integrante da fase preparatória (art. 18, X).',
    'O sistema de registro de preços na Lei 14.133/2021 permite adesão à ata por outros órgãos, com limite de 50% dos itens.',
    'A Lei 14.133/2021 trouxe o Portal Nacional de Contratações Públicas (PNCP) como ferramenta de transparência obrigatória.',
    'O Termo de Referência, conforme a Lei 14.133/2021, deve conter a definição do objeto, fundamentação da contratação, descrição da solução e requisitos.',
    'A Lei 14.133/2021 privilegia o julgamento por menor preço ou maior desconto como critérios principais para bens e serviços comuns.',
    'Segundo a Lei 14.133/2021, é vedada a participação de empresas reunidas em consórcio nos casos de bens e serviços comuns.',
    'A segregação de funções é um princípio fundamental na Lei 14.133/2021, impedindo que a mesma pessoa exerça funções incompatíveis.',
];

/** Labels amigáveis para os campos do DOD */
export const DOD_FIELD_LABELS: Record<string, string> = {
    nome_projeto: 'Nome do Projeto',
    data_envio: 'Data de Envio',
    identificacao_pca: 'Identificação da Demanda do Plano de Contratações Anual de TIC - 2026',
    alinhamento_loa: 'Alinhamento com a LOA',
    motivacao_justificativa: 'Motivação/Justificativa',
    resultados_beneficios: 'Resultados e Benefícios a Serem Alcançados',
    fonte_recurso: 'Fonte de Recurso',
    'planejamento_estrategico.plano_gestao': 'Plano de Gestão do Poder Judiciário do Estado de Goiás',
    'planejamento_estrategico.plano_anual_contratacoes': 'Plano Anual de Contratações de TIC',
    'planejamento_estrategico.pdtic': 'Plano Diretor de Tecnologia da Informação e Comunicação (PDTIC)',
    'planejamento_estrategico.entic_jud': 'Estratégia Nacional de Tecnologia da Informação e Comunicação do Poder Judiciário (ENTIC-JUD)',
};

/** Descrições dos campos do DOD */
export const DOD_FIELD_DESCRIPTIONS: Record<string, string> = {
    motivacao_justificativa:
        'Descrição da necessidade da contratação, considerando o problema a ser resolvido sob a perspectiva do interesse público.',
    resultados_beneficios:
        'O que a solução vai trazer para o órgão em termos de benefícios e resultados com foco na eficácia, eficiência, economicidade e padronização.',
};

/** Labels amigáveis para os campos do ETP */
export const ETP_FIELD_LABELS: Record<string, string> = {
    resp_descricao_solucao: '1.1. Descrição da Necessidade da Solução de TIC',
    resp_potenciais_usuarios: 'Potenciais Usuários',
    resp_requisitos_tecnologicos: 'Requisitos Tecnológicos',
    resp_requisitos_legais: 'Requisitos Legais',
    resp_requisitos_temporais: 'Requisitos Temporais',
    resp_requisitos_capacitacao: 'Requisitos de Capacitação, Treinamento e Suporte',
    resp_requisitos_manutencao: 'Requisitos de Manutenção',
    resp_requisitos_seguranca: 'Requisitos de Segurança e Privacidade',
    resp_requisitos_social_cultural_sustentabilidade: 'Requisitos Sociais, Culturais e de Sustentabilidade',
    resp_requisitos_niveis_servico: 'Requisitos de Níveis de Serviço',
    resp_requisitos_qualificacao_experiencia: 'Requisitos de Qualificação e Experiência da Empresa Contratada',
    resp_requisitos_formas_comunicacao: 'Requisitos de Formas de Comunicação',
    resp_requisitos_padroes_interoperabilidade: 'Requisitos de Padrões e Modelos de Interoperabilidade',
    resp_outros_requisitos: 'Outros Requisitos',
    resp_avaliacao_diferentes_solucoes_disponiveis: '1.3. Avaliação das Diferentes Soluções Disponíveis no Mercado',
    resp_periodo_analisado: 'Período analisado',
    resp_termos_analisados: 'Termos pesquisados',
    resp_metodologia_de_calculo: 'Metodologia de cálculo',
    resp_alternativa_1: 'Alternativa 1',
    resp_alternativa_2: 'Alternativa 2',
    resp_alternativa_3: 'Alternativa 3',
    resp_alternativa_4: 'Alternativa 4',
    resp_alternativa_5: 'Alternativa 5',
    resp_justificativa_escola_solucao_de_ti: '1.4. Justificativa de Escolha da Solução de TI',
    resp_relacao_demanda_prevista_e_quantidade: '1.5. Relação entre a Demanda Prevista e a Quantidade',
    resp_relacao_necessidade_volumes: 'Relação entre Necessidade e Volumes',
    resp_forma_calculo_quantitativo: 'Forma de Cálculo do Quantitativo',
    resp_natureza_objeto: 'Natureza do Objeto',
    resp_modalidade_tipo_licitacao: 'Modalidade e Tipo de Licitação',
    resp_parcelamento_objeto: 'Parcelamento do Objeto',
    resp_vigencia_contrato: 'Vigência do Contrato',
    resp_necessidades_adequacao_ambiente: '1.6. Necessidades de Adequação do Ambiente',
    resp_parcelas_fornecimento: 'Divisão em Parcelas para o Fornecimento',
    resp_quantitativo_bens_servicos: 'Quantitativo de Bens e Serviços',
    resp_motivacao_justificativa_escolha: 'Motivação e Justificativa de Escolha',
    resp_necessidade_recursos_materiais_humanos: '1.7. Necessidade de Recursos Materiais e Humanos',
    resp_estrategia_continuidade: '1.8. Estratégia de Continuidade da Solução',
    resp_estrategia_independencia_tjgo: '1.9. Estratégia de Independência do TJGO',
    resp_acoes_transicao: '1.10. Ações para Transição Contratual e Encerramento',
    resp_viabilidade_economica_contratacao: '1.11. Análise sobre a Viabilidade Econômica da Contratação',
    resp_aprovacao_assinatura_estudo_tecnico: '1.13. Aprovação e Assinatura do Estudo Técnico Preliminar',
};

/** Labels amigáveis para os campos do TR */
export const TR_FIELD_LABELS: Record<string, string> = {
    resp_objeto_descricao: '1. OBJETO',
    resp_objeto_lote: '1. OBJETO',
    resp_objeto_item: '1. OBJETO',
    resp_objeto_objeto: '1. OBJETO',
    resp_objeto_quantidade: '1. OBJETO',
    resp_objeto_unidade: '1. OBJETO',
    resp_justificativa: '2. FUNDAMENTAÇÃO E JUSTIFICATIVA DA CONTRATAÇÃO',
    resp_beneficios_objetivos: '2. FUNDAMENTAÇÃO E JUSTIFICATIVA DA CONTRATAÇÃO',
    resp_do_agrupamento_do_objeto: '3. DO AGRUPAMENTO DO OBJETO',
    resp_caracteristicas_especificacoes_objeto: '4. CARACTERÍSTICAS E ESPECIFICAÇÕES DO OBJETO (DESCREVER DETALHADAMENTE)',
    resp_vigencia_local_prazo_entrega: '5. VIGÊNCIA, LOCAL E PRAZO DE ENTREGA',
    resp_proposta_de_precos: '7. PROPOSTA DE PREÇOS',
    resp_plano_aquisicao_contratacao_distribuicao: '8. PLANO DE AQUISIÇÃO / CONTRATAÇÃO / DISTRIBUIÇÃO',
    resp_obrigacoes_contratada: '9. DAS OBRIGAÇÕES DA CONTRATADA',
    resp_prevenc_consciencia_combate_racismo: '9.1. DA PREVENÇÃO, CONSCIENTIZAÇÃO E COMBATE AO RACISMO',
    resp_prevenc_enfrentamento_assedio_moral: '9.2. DA PREVENÇÃO E ENFRENTAMENTO DO ASSÉDIO MORAL, DO ASSÉDIO SEXUAL E DA DISCRIMINAÇÃO',
    resp_protecao_dados: '9.3. DA PROTEÇÃO DE DADOS',
    resp_crit_sustentabilidade: '9.4. DOS CRITÉRIOS DE SUSTENTABILIDADE',
    resp_reserva_cargos: '9.5. DA RESERVA DE CARGOS',
    resp_obrigacoes_contratante: '10. DAS OBRIGAÇÕES DA CONTRATANTE',
    resp_infracoes_sancoes_administrativas: '11. DAS INFRAÇÕES E SANÇÕES ADMINISTRATIVAS',
    resp_subcontratacao: '12. DA SUBCONTRATAÇÃO',
    resp_vedacao_participacao: '13. DA VEDAÇÃO DA PARTICIPAÇÃO DE PESSOA JURÍDICA EM CONSÓRCIO',
    resp_habilitacao: '14. DA HABILITAÇÃO',
    resp_habilitacao_qualificacao_economica: '14.3. QUALIFICAÇÃO ECONÔMICO-FINANCEIRA:',
    resp_habilitacao_qualificacao_tecnica: '14.4. QUALIFICAÇÃO TÉCNICA',
    resp_forma_pagamento: '15. FORMA DE PAGAMENTO',
    resp_valores_estimados: '16. DOS VALORES ESTIMADOS',
    resp_documentos_complementares: '17. DOCUMENTOS COMPLEMENTARES',
};
