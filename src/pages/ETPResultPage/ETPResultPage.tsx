import { useState } from 'react';
import { RotateCcw, CheckCircle2, Settings, FileText, FileType, FileOutput, LayoutGrid } from 'lucide-react';
import { exportDocument } from '../../utils/exportService';
import ApiConfigModal from '../../components/features/ApiConfigModal';
import ETPDocumentEditor from '../../components/features/DocumentEditor/ETPDocumentEditor';
import FloatingActions from '../../components/features/DocumentEditor/FloatingActions';
import type { ETPResponse, FieldSelection } from '../../types';
import { ETP_FIELD_LABELS } from '../../config/constants';
import SuggestionField from '../../components/ui/SuggestionField';
import { getETPSuggestions } from '../../components/features/DocumentEditor/ETPRichTextCanvas';

interface ETPResultPageProps {
    response: ETPResponse;
    onReset: () => void;
    onConfirmEditing: (selections: Record<string, FieldSelection>) => void;
}

/**
 * Campos simples do ETP que possuem sugestões como arrays de strings no nível raiz da resposta.
 */
const ETP_SIMPLE_FIELDS = [
    'resp_descricao_solucao',
    'resp_potenciais_usuarios',
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
    'resp_outros_requisitos',
    'resp_necessidade_recursos_materiais_humanos',
    'resp_relacao_necessidade_volumes',
    'resp_forma_calculo_quantitativo',
    'resp_natureza_objeto',
    'resp_modalidade_tipo_licitacao',
    'resp_parcelamento_objeto',
    'resp_vigencia_contrato',
    'resp_parcelas_fornecimento',
    'resp_quantitativo_bens_servicos',
    'resp_motivacao_justificativa_escolha',
    'resp_estrategia_continuidade',
    'resp_estrategia_independencia_tjgo',
    'resp_acoes_transicao',
    'resp_viabilidade_economica_contratacao',
    'resp_aprovacao_assinatura_estudo_tecnico',
] as const;

/**
 * Inicializa as seleções padrão (primeira sugestão para cada campo)
 */
function initSelections(): Record<string, FieldSelection> {
    const selections: Record<string, FieldSelection> = {};

    for (const key of ETP_SIMPLE_FIELDS) {
        selections[key] = { fieldKey: key, selectedIndex: 0, isEditing: false };
    }

    return selections;
}

/**
 * Página de resultado do ETP com sugestões editáveis e editor de documento.
 */
export default function ETPResultPage({ response, onReset, onConfirmEditing }: ETPResultPageProps) {
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
        exportDocument(format, 'ETP');
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
                        {ETP_SIMPLE_FIELDS.map((key) => {
                            const suggestions = getETPSuggestions(response, key);

                            return (
                                <SuggestionField
                                    key={key}
                                    fieldKey={key}
                                    label={ETP_FIELD_LABELS[key] || key}
                                    suggestions={suggestions}
                                    selection={selections[key]}
                                    onSelectionChange={handleSelectionChange}
                                />
                            );
                        })}
                    </>
                ) : (
                    <ETPDocumentEditor
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
                    documentLabel="ETP"
                    onConfirmEditing={() => onConfirmEditing(selections)}
                    confirmLabel="Próxima Etapa: Gerar TR"
                />
            )}

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
                <button
                    className="btn btn--primary"
                    onClick={() => onConfirmEditing(selections)}
                    id="btn-next-step-tr"
                >
                    Próxima Etapa: Gerar TR
                </button>
            </div>
        </div>
    );
}
