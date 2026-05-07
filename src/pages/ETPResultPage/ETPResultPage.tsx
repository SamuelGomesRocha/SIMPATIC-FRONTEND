import { useState } from 'react';
import { RotateCcw, CheckCircle2, Settings, FileText, FileType, FileOutput, LayoutGrid, Target } from 'lucide-react';
import { exportDocument, generatePopulatedHtml } from '../../utils/exportService';
import ApiConfigModal from '../../components/features/ApiConfigModal';
import ETPDocumentEditor from '../../components/features/DocumentEditor/ETPDocumentEditor';
import FloatingActions from '../../components/features/DocumentEditor/FloatingActions';
import type { ETPResponse, FieldSelection, SuggestionItem } from '../../types';
import { ETP_FIELD_LABELS } from '../../config/constants';
import { getETPStandardText } from '../../config/standardTexts';
import SuggestionField from '../../components/ui/SuggestionField/SuggestionField';
import { CalculoQuantitativoField } from '../../components/ui/CalculoQuantitativoField/CalculoQuantitativoField';
import { NaturezaObjetoField } from '../../components/ui/NaturezaObjetoField/NaturezaObjetoField';
import { getETPSuggestions } from '../../components/features/DocumentEditor/ETPRichTextCanvas';

interface ETPResultPageProps {
    response: ETPResponse;
    onReset: () => void;
    onConfirmEditing?: (selections: Record<string, FieldSelection>) => void;
    /** trace_id da sessão de geração do ETP (habilita avaliação humana) */
    traceId?: string | null;
}

/**
 * Estrutura hierárquica de seções do ETP, alinhada com o template oficial.
 * Cada seção contém um título de grupo e os field-keys correspondentes.
 *
 * Campos de nível raiz (string[]) são exibidos diretamente.
 * Campos aninhados (sub-objetos) são resolvidos via `getETPSuggestions`.
 * Campos complexos (arrays de objetos) usam a chave-pai e são
 *   formatados como texto legível por `getETPSuggestions`.
 */
interface ETPSection {
    id: string;
    title: string;
    fields: readonly string[];
}

const ETP_SECTIONS: readonly ETPSection[] = [
    {
        id: '1.1',
        title: '1.1. Descrição da Necessidade da Solução de TIC',
        fields: ['resp_descricao_solucao', 'resp_potenciais_usuarios'],
    },
    {
        id: '1.2',
        title: '1.2. Requisitos da Contratação',
        fields: [
            'resp_requisitos_tecnologicos',
            'resp_requisitos_legais',
            'resp_requisitos_temporais',
            'resp_requisitos_capacitacao',
            'resp_requisitos_manutencao',
            'resp_requisitos_seguranca',
            'resp_requisitos_social_cultural_sustentabilidade',
            'resp_requisitos_niveis_servico',
            'resp_requisitos_qualificacao_experiencia',
            'resp_requisitos_formas_comunicacao',
            'resp_padroes_interoperabilidade',
            'resp_outros_requisitos',
        ],
    },
    {
        id: '1.3',
        title: '1.3. Avaliação das Diferentes Soluções Disponíveis no Mercado',
        fields: [
            'resp_periodo_analisado',
            'resp_termos_analisados',
            'resp_metodologia_de_calculo',
            'resp_alternativa_1',
            'resp_alternativa_2',
            'resp_alternativa_3',
            'resp_alternativa_4',
            'resp_alternativa_5',
        ],
    },
    {
        id: '1.4',
        title: '1.4. Justificativa de Escolha da Solução de TI',
        fields: [
            'resp_motivacao_justificativa_escolha',
        ],
    },
    {
        id: '1.5',
        title: '1.5. Relação entre a Demanda Prevista e a Quantidade',
        fields: [
            'resp_relacao_necessidade_volumes',
            'resp_forma_calculo_quantitativo',
            'resp_natureza_objeto',
            'resp_modalidade_tipo_licitacao',
            'resp_parcelamento_objeto',
            'resp_vigencia_contrato',
        ],
    },
    {
        id: '1.6',
        title: '1.6. Necessidades de Adequação do Ambiente',
        fields: [
            'resp_infraestrutura_tecnologica',
            'resp_infraestrutura_eletrica',
            'resp_logistica_implantacao',
            'resp_espaco_fisico',
            'resp_mobiliario',
        ],
    },
    {
        id: '1.7',
        title: '1.7. Necessidade de Recursos Materiais e Humanos',
        fields: ['resp_necessidade_recursos_materiais_humanos'],
    },
    {
        id: '1.8_1.9',
        title: '1.8 / 1.9. Gestão de Riscos e Independência',
        fields: [
            'resp_estrategia_continuidade',
            'resp_estrategia_independencia_tjgo',
        ],
    },
    {
        id: '1.10',
        title: '1.10. Ações para Transição Contratual e Encerramento',
        fields: ['resp_acoes_transicao'],
    },
    {
        id: '1.11',
        title: '1.11. Análise sobre a Viabilidade Econômica da Contratação',
        fields: ['resp_viabilidade_economica_contratacao'],
    },
    {
        id: '1.13',
        title: '1.13. Aprovação e Assinatura do Estudo Técnico Preliminar',
        fields: ['resp_aprovacao_assinatura_estudo_tecnico'],
    },
] as const;

/** Coleta todos os field-keys das seções para inicialização e iteração */
const ALL_ETP_FIELD_KEYS = ETP_SECTIONS.flatMap(s => s.fields);

/**
 * Inicializa as seleções padrão (primeira sugestão para cada campo)
 */
function initSelections(): Record<string, FieldSelection> {
    const selections: Record<string, FieldSelection> = {};

    for (const key of ALL_ETP_FIELD_KEYS) {
        selections[key] = { fieldKey: key, selectedIndex: 0, isEditing: false };
    }

    return selections;
}

/**
 * Página de resultado do ETP com sugestões editáveis e editor de documento.
 */
export default function ETPResultPage({ response, onReset, onConfirmEditing, traceId }: ETPResultPageProps) {
    const [selections, setSelections] = useState<Record<string, FieldSelection>>(initSelections);
    const [isApiConfigOpen, setIsApiConfigOpen] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [viewMode, setViewMode] = useState<'simplified' | 'advanced'>('simplified');

    const handleSelectionChange = (fieldKey: string, partial: Partial<FieldSelection>) => {
        setSelections((prev) => ({
            ...prev,
            [fieldKey]: {
                ...prev[fieldKey],
                ...partial,
                fieldKey,
            },
        }));
    };

    const handleExport = (format: 'pdf' | 'docx' | 'odt') => {
        if (viewMode === 'simplified') {
            const html = generatePopulatedHtml('ETP', response, selections);
            exportDocument(format, 'ETP', html);
        } else {
            exportDocument(format, 'ETP');
        }
        setShowExportMenu(false);
    };

    const exportActions = (
        <div className="export-menu-container">
            <button
                className="btn btn--success btn--lg"
                onClick={() => setShowExportMenu(!showExportMenu)}
                id="btn-export-etp-main"
            >
                <FileOutput size={18} />
                Exportar ETP
            </button>
            {showExportMenu && (
                <div className="export-menu">
                    <button onClick={() => handleExport('pdf')}>
                        <FileText size={16} /> PDF (.pdf)
                    </button>
                    <button onClick={() => handleExport('docx')}>
                        <FileType size={16} /> Word (.docx)
                    </button>
                    <button onClick={() => handleExport('odt')}>
                        <FileType size={16} /> OpenOffice (.odt)
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="result-page" id="etp-result-page">
            <ApiConfigModal isOpen={isApiConfigOpen} onClose={() => setIsApiConfigOpen(false)} />

            <div className="result-page__header">
                <div className="result-page__badge result-page__badge--etp">
                    <CheckCircle2 size={14} />
                    Sugestões do ETP Geradas com Sucesso
                </div>
                <h1 className="result-page__title">
                    Estudo Técnico Preliminar
                </h1>
                <p className="result-page__description">
                    Revise as sugestões do Estudo Técnico Preliminar abaixo. Você pode selecionar a sugestão
                    desejada ou editar manualmente cada campo. Após a revisão, escolha um formato para exportar.
                </p>
            </div>

            <div className="result-page__actions">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="view-toggle">
                        <button
                            className={`view-toggle__btn ${viewMode === 'simplified' ? 'view-toggle__btn--active' : ''}`}
                            onClick={() => setViewMode('simplified')}
                        >
                            <LayoutGrid size={16} />
                            Visão Simplificada
                        </button>
                        <button
                            className={`view-toggle__btn ${viewMode === 'advanced' ? 'view-toggle__btn--active' : ''}`}
                            onClick={() => setViewMode('advanced')}
                        >
                            <FileText size={16} />
                            Edição Avançada
                        </button>
                    </div>
                    {exportActions}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                        className="btn btn--ghost"
                        onClick={() => setIsApiConfigOpen(true)}
                        title="Configurar API"
                    >
                        <Settings size={18} />
                    </button>
                    {onConfirmEditing && (
                        <button
                            className="btn btn--primary"
                            onClick={() => onConfirmEditing(selections)}
                        >
                            <Target size={16} />
                            Gerar Termo de Referência
                        </button>
                    )}
                    <button
                        className="btn btn--secondary"
                        onClick={onReset}
                        id="btn-new-demanda-etp"
                    >
                        <RotateCcw size={16} />
                        Nova Demanda
                    </button>
                </div>
            </div>

            <div key={viewMode} className="view-fade-in">
                {viewMode === 'simplified' ? (
                    <>
                        {ETP_SECTIONS.map((section) => (
                            <div className="pe-section" key={section.id}>
                                <div className="pe-section__header">
                                    {section.title}
                                </div>
                                <div className="pe-section__body">
                                    {section.fields.map((key) => {
                                        const aiSuggestions: SuggestionItem[] = getETPSuggestions(response, key)
                                            .map(text => ({ text, source: 'ai' as const }));

                                        const standardText = getETPStandardText(key);
                                        const allSuggestions: SuggestionItem[] = standardText
                                            ? [{ text: standardText, source: 'standard' as const }, ...aiSuggestions]
                                            : aiSuggestions;

                                        if (key === 'resp_forma_calculo_quantitativo') {
                                            return (
                                                <CalculoQuantitativoField
                                                    key={key}
                                                    fieldKey={key}
                                                    label={ETP_FIELD_LABELS[key] || key}
                                                    selection={selections[key] || { fieldKey: key, selectedIndex: -1, isEditing: true, customValue: '[]' }}
                                                    onSelectionChange={handleSelectionChange}
                                                />
                                            );
                                        }

                                        if (key === 'resp_natureza_objeto') {
                                            return (
                                                <NaturezaObjetoField
                                                    key={key}
                                                    fieldKey={key}
                                                    label={ETP_FIELD_LABELS[key] || key}
                                                    selection={selections[key] || { fieldKey: key, selectedIndex: -1, isEditing: true, customValue: '' }}
                                                    onSelectionChange={handleSelectionChange}
                                                />
                                            );
                                        }

                                        return (
                                            <SuggestionField
                                                key={key}
                                                fieldKey={key}
                                                label={ETP_FIELD_LABELS[key] || key}
                                                suggestions={allSuggestions}
                                                selection={selections[key] || { fieldKey: key, selectedIndex: 0, isEditing: false }}
                                                onSelectionChange={handleSelectionChange}
                                                traceId={traceId}
                                                documentType="ETP"
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <ETPDocumentEditor
                        response={response}
                        selections={selections}
                        onSelectionChange={handleSelectionChange}
                        traceId={traceId}
                    />
                )}
            </div>
            <FloatingActions
                onExport={(format) => handleExport(format)}
                onReset={onReset}
                documentLabel="ETP"
                onConfirmEditing={onConfirmEditing ? () => onConfirmEditing(selections) : undefined}
                confirmLabel="Próxima Etapa: Gerar TR"
            />

            {/* Ações finais */}
            <div className="result-page__actions" style={{ marginTop: '2rem' }}>
                {exportActions}
                <button
                    className="btn btn--secondary"
                    onClick={onReset}
                    id="btn-new-demanda-etp-bottom"
                >
                    <RotateCcw size={16} />
                    Nova Demanda
                </button>
                {onConfirmEditing && (
                    <button
                        className="btn btn--primary"
                        onClick={() => onConfirmEditing(selections)}
                        id="btn-next-step-tr"
                    >
                        Próxima Etapa: Gerar TR
                    </button>
                )}
            </div>
        </div>
    );
}
