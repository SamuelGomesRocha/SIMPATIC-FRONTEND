import { useState } from 'react';
import { RotateCcw, CheckCircle2, Settings, FileText, FileType, FileOutput, LayoutGrid } from 'lucide-react';
import { exportDocument } from '../../utils/exportService';
import ApiConfigModal from '../../components/features/ApiConfigModal';
import TRDocumentEditor from '../../components/features/DocumentEditor/TRDocumentEditor';
import FloatingActions from '../../components/features/DocumentEditor/FloatingActions';
import type { TRResponse, FieldSelection } from '../../types';
import { TR_FIELD_LABELS } from '../../config/constants';
import SuggestionField from '../../components/ui/SuggestionField';
import { getTRSuggestions } from '../../components/features/DocumentEditor/TRRichTextCanvas';

interface TRResultPageProps {
    response: TRResponse;
    onReset: () => void;
}

const TR_SIMPLE_FIELDS = [
    'resp_objeto_descricao',
    'resp_objeto_lote',
    'resp_objeto_item',
    'resp_objeto_objeto',
    'resp_objeto_quantidade',
    'resp_objeto_unidade',
    'resp_justificativa',
    'resp_beneficios_objetivos',
    'resp_do_agrupamento_do_objeto',
    'resp_caracteristicas_especificacoes_objeto',
    'resp_vigencia_local_prazo_entrega',
    'resp_proposta_de_precos',
    'resp_plano_aquisicao_contratacao_distribuicao',
    'resp_obrigacoes_contratada',
    'resp_prevenc_consciencia_combate_racismo',
    'resp_prevenc_enfrentamento_assedio_moral',
    'resp_protecao_dados',
    'resp_crit_sustentabilidade',
    'resp_reserva_cargos',
    'resp_obrigacoes_contratante',
    'resp_infracoes_sancoes_administrativas',
    'resp_subcontratacao',
    'resp_vedacao_participacao',
    'resp_habilitacao',
    'resp_habilitacao_qualificacao_economica',
    'resp_habilitacao_qualificacao_tecnica',
    'resp_forma_pagamento',
    'resp_valores_estimados',
    'resp_documentos_complementares'
] as const;

function initSelections(): Record<string, FieldSelection> {
    const selections: Record<string, FieldSelection> = {};
    for (const key of TR_SIMPLE_FIELDS) {
        selections[key] = { fieldKey: key, selectedIndex: 0, isEditing: false };
    }
    return selections;
}

export default function TRResultPage({ response, onReset }: TRResultPageProps) {
    const [selections, setSelections] = useState<Record<string, FieldSelection>>(initSelections);
    const [isApiConfigOpen, setIsApiConfigOpen] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [viewMode, setViewMode] = useState<'simplified' | 'advanced'>('advanced');

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
        exportDocument(format, 'TR');
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
                Exportar Termo de Referência
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
                <div className="result-page__badge result-page__badge--etp">
                    <CheckCircle2 size={14} />
                    Sugestões do TR Geradas com Sucesso
                </div>
                <h1 className="result-page__title">
                    Termo de Referência
                </h1>
                <p className="result-page__description">
                    Revise as sugestões do Termo de Referência abaixo. Você pode selecionar a sugestão
                    desejada ou editar manualmente cada campo. Após a revisão, escolha um formato para exportar.
                </p>
            </div>

            <div className="result-page__actions">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="view-toggle">
                        <button
                            className={`view-toggle__btn ${viewMode === 'advanced' ? 'view-toggle__btn--active' : ''}`}
                            onClick={() => setViewMode('advanced')}
                        >
                            <FileText size={16} />
                            Edição Avançada
                        </button>
                        <button
                            className={`view-toggle__btn ${viewMode === 'simplified' ? 'view-toggle__btn--active' : ''}`}
                            onClick={() => setViewMode('simplified')}
                        >
                            <LayoutGrid size={16} />
                            Visão Simplificada
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
                        {TR_SIMPLE_FIELDS.map((key) => {
                            const suggestions = getTRSuggestions(response, key);

                            return (
                                <SuggestionField
                                    key={key}
                                    fieldKey={key}
                                    label={TR_FIELD_LABELS[key] || key}
                                    suggestions={suggestions}
                                    selection={selections[key]}
                                    onSelectionChange={handleSelectionChange}
                                />
                            );
                        })}
                    </>
                ) : (
                    <TRDocumentEditor
                        response={response}
                        selections={selections}
                        onSelectionChange={handleSelectionChange}
                    />
                )}
            </div>

            {viewMode === 'advanced' && (
                <FloatingActions
                    onExport={(format) => handleExport(format)}
                    onReset={onReset}
                    documentLabel="TR"
                />
            )}

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
