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
export const DEFAULT_API_MODEL = 'gemini-2.5-flash-lite';

/** Opções de Modelos do Gemini */
export const GEMINI_MODEL_OPTIONS = [
    { value: 'models/gemini-3.1-flash-lite-preview', label: 'gemini-3.1-flash-lite (Preview)' },
    { value: 'gemini-2.5-flash-lite', label: 'gemini-2.5-flash-lite (Padrão)' },
    { value: 'gemini-2.5-flash', label: 'gemini-2.5-flash' },
];

/** Ambiente padrão da API */
export const DEFAULT_API_ENVIRONMENT = 'producao';

/** URL padrão da API */
export const DEFAULT_API_URL = 'http://127.0.0.1:8000';

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

/** Opções de Meses para Data Prevista */
export const MESES_OPTIONS = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
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
    'planejamento_estrategico': 'Alinhamento Estratégico',
};

/** Descrições dos campos do DOD */
export const DOD_FIELD_DESCRIPTIONS: Record<string, string> = {
    motivacao_justificativa:
        'Descrição da necessidade da contratação, considerando o problema a ser resolvido sob a perspectiva do interesse público.',
    resultados_beneficios:
        'O que a solução vai trazer para o órgão em termos de benefícios e resultados com foco na eficácia, eficiência, economicidade e padronização.',
};

/** Mapeamento Front-to-Back: campo do React → dod_section no banco */
export const DOD_SECTION_MAPPING: Record<string, string> = {
    "nome_projeto": "Identificação - Nome do Projeto",
    "data_envio": "Identificação - Data",
    "identificacao_pca": "Identificação PCA",
    "fonte_recurso": "Fonte de Recursos",
    "alinhamento_loa": "Alinhamento LOA",
    "motivacao_justificativa": "Motivação e Justificativa",
    "resultados_beneficios": "Resultados e Benefícios",
    "planejamento_estrategico.plano_gestao": "Plano de Gestão",
    "planejamento_estrategico.plano_anual_contratacoes": "Plano Anual",
    "planejamento_estrategico.pdtic": "PDTIC",
    "planejamento_estrategico.entic_jud": "ENTIC-JUD"
};

/** Lista de seções DOD que suportam avaliação humana */
export const EVALUABLE_DOD_SECTIONS = Object.keys(DOD_SECTION_MAPPING);

/** Labels amigáveis para os campos do ETP */
export const ETP_FIELD_LABELS: Record<string, string> = {
    /* 1.1 — Descrição e Usuários */
    resp_descricao_solucao: '1.1. Descrição da Necessidade da Solução de TIC',
    resp_potenciais_usuarios: 'Potenciais Usuários',

    /* 1.2 — Requisitos */
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
    resp_mni: 'Interoperabilidade: MNI',
    resp_icp_brasil: 'Interoperabilidade: ICP-Brasil',
    resp_moreq_jus: 'Interoperabilidade: MoReq-Jus',
    resp_padroes_interoperabilidade: 'Requisitos de Padrões e Modelos de Interoperabilidade',
    resp_outros_requisitos: 'Outros Requisitos',

    /* 1.3 — Levantamento de Mercado */
    resp_avaliacao_diferentes_solucoes_disponiveis: '1.3. Avaliação das Diferentes Soluções Disponíveis no Mercado',
    resp_periodo_analisado: 'Período analisado',
    resp_termos_analisados: 'Termos pesquisados',
    resp_metodologia_de_calculo: 'Metodologia de cálculo',
    resp_alternativa_1: 'Alternativa 1',
    resp_alternativa_2: 'Alternativa 2',
    resp_alternativa_3: 'Alternativa 3',
    resp_alternativa_4: 'Alternativa 4',
    resp_alternativa_5: 'Alternativa 5',

    /* 1.4 — Justificativa de Escolha */
    resp_justificativa_escola_solucao_de_ti: '1.4. Justificativa de Escolha da Solução de TI',
    resp_motivacao_justificativa_escolha: 'Motivação e Justificativa de Escolha',

    /* 1.5 — Demanda e Quantidade */
    resp_relacao_demanda_prevista_e_quantidade: '1.5. Relação entre a Demanda Prevista e a Quantidade',
    resp_relacao_necessidade_volumes: 'Relação entre Necessidade e Volumes',
    resp_forma_calculo_quantitativo: 'Forma de Cálculo do Quantitativo',
    resp_natureza_objeto: 'Natureza do Objeto',
    resp_modalidade_tipo_licitacao: 'Modalidade e Tipo de Licitação',
    resp_parcelamento_objeto: 'Parcelamento do Objeto',
    resp_vigencia_contrato: 'Vigência do Contrato',

    /* 1.6 — Adequação do Ambiente */
    resp_necessidades_adequacao_ambiente: '1.6. Necessidades de Adequação do Ambiente',
    resp_infraestrutura_tecnologica: 'Infraestrutura Tecnológica',
    resp_infraestrutura_eletrica: 'Infraestrutura Elétrica',
    resp_logistica_implantacao: 'Logística de Implantação',
    resp_espaco_fisico: 'Espaço Físico',
    resp_mobiliario: 'Mobiliário',

    /* 1.7 — Recursos Materiais e Humanos */
    resp_necessidade_recursos_materiais_humanos: '1.7. Necessidade de Recursos Materiais e Humanos',

    /* 1.8 / 1.9 — Gestão de Riscos e Independência */
    resp_estrategia_continuidade: '1.8. Estratégia de Continuidade da Solução',
    resp_estrategia_independencia_tjgo: '1.9. Estratégia de Independência do TJGO',

    /* 1.10 — Transição Contratual */
    resp_acoes_transicao: '1.10. Ações para Transição Contratual e Encerramento',

    /* 1.11 — Viabilidade Econômica */
    resp_viabilidade_economica_contratacao: '1.11. Análise sobre a Viabilidade Econômica da Contratação',

    /* 1.13 — Aprovação */
    resp_aprovacao_assinatura_estudo_tecnico: '1.13. Aprovação e Assinatura do Estudo Técnico Preliminar',
};

/** Lista de seções ETP que suportam avaliação humana */
export const EVALUABLE_ETP_SECTIONS = Object.keys(ETP_FIELD_LABELS);

/** Labels amigáveis para os campos do TR */
export const TR_FIELD_LABELS: Record<string, string> = {
    /* Objeto da Contratação */
    resp_objeto_descricao: 'Detalhamento Técnico do Objeto (Tabela)',
    resp_objeto_lote: 'Lote',
    resp_objeto_item: 'Item',
    resp_objeto_objeto: 'Objeto/Especificação',
    resp_objeto_quantidade: 'Quantidade',
    resp_objeto_unidade: 'Unidade de Medida',

    /* Fundamentação e Benefícios */
    resp_justificativa: 'Fundamentação e Justificativa da Contratação',
    resp_beneficios_objetivos: 'Benefícios e Resultados Esperados',
    resp_do_agrupamento_do_objeto: 'Do Agrupamento do Objeto',

    /* Especificações e Prazos */
    resp_caracteristicas_especificacoes_objeto: 'Características e Especificações do Objeto',
    resp_perfil_exigido_profissionais: 'Perfil Exigido dos Profissionais',
    resp_garantia_contratual: 'Garantia Contratual',
    resp_amostra_poc: 'Apresentação de Amostra ou Realização de POC',
    resp_vistoria: 'Vistoria',
    resp_vigencia_local_prazo_entrega: 'Vigência, Local e Prazo de Entrega',
    resp_proposta_de_precos: 'Proposta de Preços',
    resp_plano_aquisicao_contratacao_distribuicao: 'Plano de Aquisição, Contratação ou Distribuição',

    /* Obrigações e Políticas Sociais */
    resp_obrigacoes_contratada: 'Obrigações da Contratada',
    resp_obrigacoes_contratante: 'Obrigações da Contratante',
    resp_prevenc_consciencia_combate_racismo: 'Prevenção, Conscientização e Combate ao Racismo',
    resp_prevenc_enfrentamento_assedio_moral: 'Prevenção e Enfrentamento do Assédio (Moral e Sexual) e Discriminação',
    resp_protecao_dados: 'Proteção de Dados (LGPD)',
    resp_crit_sustentabilidade: 'Critérios de Sustentabilidade',
    resp_reserva_cargos: 'Reserva de Cargos',

    /* Sanções e Participação */
    resp_infracoes_sancoes_administrativas: 'Infrações e Sanções Administrativas',
    resp_subcontratacao: 'Subcontratação',
    resp_vedacao_participacao: 'Vedação da Participação de Pessoa Jurídica em Consórcio',

    /* Habilitação e Qualificação */
    resp_habilitacao: 'Habilitação Geral',
    resp_habilitacao_qualificacao_economica: 'Qualificação Econômico-Financeira',
    resp_habilitacao_qualificacao_tecnica: 'Qualificação Técnica',

    /* Valores e Pagamento */
    resp_forma_pagamento: 'Forma de Pagamento',
    resp_valores_estimados: 'Valores Estimados',

    /* Documentos e Anexos */
    resp_documentos_complementares: 'Documentos Complementares',
};

/** Lista de seções TR que suportam avaliação humana */
export const EVALUABLE_TR_SECTIONS = Object.keys(TR_FIELD_LABELS);
