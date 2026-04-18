import { useState } from 'react';
import { RotateCcw, CheckCircle2, Settings, FileText, FileType, FileOutput, LayoutGrid } from 'lucide-react';
import { exportDocument, generatePopulatedHtml } from '../../utils/exportService';
import ApiConfigModal from '../../components/features/ApiConfigModal';
import TRDocumentEditor from '../../components/features/DocumentEditor/TRDocumentEditor';
import FloatingActions from '../../components/features/DocumentEditor/FloatingActions';
import type { TRResponse, FieldSelection, SuggestionItem } from '../../types';
import { TR_FIELD_LABELS } from '../../config/constants';
import { getTRStandardText } from '../../config/standardTexts';
import SuggestionField from '../../components/ui/SuggestionField';
import { ObjetoTRField } from '../../components/ui/ObjetoTRField/ObjetoTRField';
import { getTRSuggestions } from '../../components/features/DocumentEditor/TRRichTextCanvas';

interface TRResultPageProps {
    response: TRResponse;
    onReset: () => void;
    /** trace_id da sessão de geração do TR (habilita avaliação humana) */
    traceId?: string | null;
}

/**
 * Estrutura hierárquica de seções do TR, baseada nas categorias principais do documento.
 * Cada seção contém um título e os field-keys correspondentes.
 */
interface TRSection {
    id: string;
    title: string;
    fields: readonly string[];
}

const TR_SECTIONS: readonly TRSection[] = [
    {
        id: 'Objeto_da_Contratacao',
        title: 'Objeto da Contratação',
        fields: [
            'resp_objeto_descricao',
            'resp_objeto_lote',
            'resp_objeto_item',
            'resp_objeto_objeto',
            'resp_objeto_quantidade',
            'resp_objeto_unidade'
        ],
    },
    {
        id: 'Fundamentacao_e_Beneficios',
        title: 'Fundamentação e Benefícios',
        fields: [
            'resp_justificativa',
            'resp_beneficios_objetivos',
            'resp_do_agrupamento_do_objeto'
        ],
    },
    {
        id: 'Especificacoes_e_Prazos',
        title: 'Especificações e Prazos',
        fields: [
            'resp_caracteristicas_especificacoes_objeto',
            'resp_perfil_exigido_profissionais',
            'resp_garantia_contratual',
            'resp_amostra_poc',
            'resp_vistoria',
            'resp_vigencia_local_prazo_entrega',
            'resp_proposta_de_precos',
            'resp_plano_aquisicao_contratacao_distribuicao'
        ],
    },
    {
        id: 'Obrigacoes_e_Politicas_Sociais',
        title: 'Obrigações e Políticas Sociais',
        fields: [
            'resp_obrigacoes_contratada',
            'resp_obrigacoes_contratante',
            'resp_prevenc_consciencia_combate_racismo',
            'resp_prevenc_enfrentamento_assedio_moral',
            'resp_protecao_dados',
            'resp_crit_sustentabilidade',
            'resp_reserva_cargos'
        ],
    },
    {
        id: 'Sancoes_e_Participacao',
        title: 'Sanções e Participação',
        fields: [
            'resp_infracoes_sancoes_administrativas',
            'resp_subcontratacao',
            'resp_vedacao_participacao'
        ],
    },
    {
        id: 'Habilitacao_e_Qualificacao',
        title: 'Habilitação e Qualificação',
        fields: [
            'resp_habilitacao',
            'resp_habilitacao_qualificacao_economica',
            'resp_habilitacao_qualificacao_tecnica'
        ],
    },
    {
        id: 'Valores_e_Pagamento',
        title: 'Valores e Pagamento',
        fields: [
            'resp_forma_pagamento',
            'resp_valores_estimados'
        ],
    },
    {
        id: 'Documentos_e_Anexos',
        title: 'Documentos e Anexos',
        fields: [
            'resp_documentos_complementares'
        ],
    }
] as const;

/** Coleta todos os field-keys das seções para inicialização e iteração */
const ALL_TR_FIELD_KEYS = TR_SECTIONS.flatMap(s => s.fields);

function initSelections(): Record<string, FieldSelection> {
    const selections: Record<string, FieldSelection> = {};
    for (const key of ALL_TR_FIELD_KEYS) {
        selections[key] = { fieldKey: key, selectedIndex: 0, isEditing: false };
    }
    return selections;
}

export default function TRResultPage({ response, onReset, traceId }: TRResultPageProps) {
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
            const html = generatePopulatedHtml('TR', response, selections);
            exportDocument(format, 'TR', html);
        } else {
            exportDocument(format, 'TR');
        }
        setShowExportMenu(false);
    };

    const exportActions = (
        <div className="export-menu-container">
            <button
                className="btn btn--success btn--lg"
                onClick={() => setShowExportMenu(!showExportMenu)}
                id="btn-export-tr-main"
            >
                <FileOutput size={18} />
                Exportar TR
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
        <div className="result-page" id="tr-result-page">
            <ApiConfigModal isOpen={isApiConfigOpen} onClose={() => setIsApiConfigOpen(false)} />

            <div className="result-page__header">
                <div className="result-page__badge">
                    <CheckCircle2 size={14} />
                    Sugestões do TR Geradas com Sucesso
                </div>
                <h1 className="result-page__title">
                    Termo de Referência
                </h1>
                <p className="result-page__description">
                    Revise as sugestões geradas para o Termo de Referência. Escolha a melhor opção
                    para cada seção ou faça edições manuais. Quando concluir, exporte o documento final.
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
                    <button
                        className="btn btn--secondary"
                        onClick={onReset}
                        id="btn-new-demanda-tr"
                    >
                        <RotateCcw size={16} />
                        Nova Demanda
                    </button>
                </div>
            </div>

            <div key={viewMode} className="view-fade-in">
                {viewMode === 'simplified' ? (
                    <>
                        {TR_SECTIONS.map((section) => (
                            <div className="pe-section" key={section.id}>
                                <div className="pe-section__header">
                                    {section.title}
                                </div>
                                <div className="pe-section__body">
                                    {section.fields.map((key) => {
                                        // Oculta os campos individuais que agora pertencem à tabela interativa do objeto
                                        if (['resp_objeto_lote', 'resp_objeto_item', 'resp_objeto_quantidade', 'resp_objeto_unidade'].includes(key)) {
                                            return null;
                                        }

                                        if (key === 'resp_objeto_descricao') {
                                            const getFirstResponse = (k: string) => {
                                                const res = getTRSuggestions(response, k);
                                                return res && res.length > 0 ? res[0] : '';
                                            };
                                            return (
                                                <ObjetoTRField
                                                    key={key}
                                                    fieldKey={key}
                                                    label="Detalhamento Técnico do Objeto (Tabela)"
                                                    selection={selections[key] || { fieldKey: key, selectedIndex: -1, isEditing: true, customValue: '[]' }}
                                                    onSelectionChange={handleSelectionChange}
                                                    initialItem={getFirstResponse('resp_objeto_item')}
                                                    initialQtd={getFirstResponse('resp_objeto_quantidade')}
                                                    initialUnidade={getFirstResponse('resp_objeto_unidade')}
                                                />
                                            );
                                        }

                                        // Transformar string[] em SuggestionItem[] usando getTRSuggestions para compatibilidade
                                        const aiSuggestions: SuggestionItem[] = getTRSuggestions(response, key).map(
                                            text => ({ text, source: 'ai' as const })
                                        );

                                        // Adicionar texto padrão se houver
                                        const standardText = getTRStandardText(key);
                                        if (standardText) {
                                            aiSuggestions.push({ text: standardText, source: 'standard' });
                                        }

                                        return (
                                            <SuggestionField
                                                key={key}
                                                fieldKey={key}
                                                label={TR_FIELD_LABELS[key] || key}
                                                suggestions={aiSuggestions}
                                                selection={selections[key]}
                                                onSelectionChange={handleSelectionChange}
                                                traceId={traceId}
                                                documentType="TR"
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <TRDocumentEditor
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
                documentLabel="TR"
            />

            <div className="result-page__actions" style={{ marginTop: '2rem' }}>
                {exportActions}
                <button
                    className="btn btn--secondary"
                    onClick={onReset}
                    id="btn-new-demanda-tr-bottom"
                >
                    <RotateCcw size={16} />
                    Nova Demanda
                </button>
            </div>
        </div>
    );
}
