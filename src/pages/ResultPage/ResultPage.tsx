import { useState } from 'react';
import { RotateCcw, CheckCircle2, Landmark, Settings, FileText, FileType, FileOutput, LayoutGrid, ArrowRight } from 'lucide-react';
import ApiConfigModal from '../../components/features/ApiConfigModal';
import DocumentEditor from '../../components/features/DocumentEditor';
import FloatingActions from '../../components/features/DocumentEditor/FloatingActions';
import type { DODResponse, FieldSelection } from '../../types';
import { DOD_FIELD_LABELS } from '../../config/constants';
import { exportDocument } from '../../utils/exportService';
import SuggestionField from '../../components/ui/SuggestionField';

interface ResultPageProps {
    response: DODResponse;
    onReset: () => void;
    onConfirmEditing?: (selections: Record<string, FieldSelection>) => void;
}

/** Campos simples (não aninhados) */
const SIMPLE_FIELDS = [
    'nome_projeto',
    'data_envio',
    'identificacao_pca',
    "fonte_recurso",
    'alinhamento_loa',
    'motivacao_justificativa',
    'resultados_beneficios',
] as const;

/** Campos do Planejamento Estratégico */
const PE_FIELDS = [
    { key: 'planejamento_estrategico.plano_gestao', dataKey: 'plano_gestao' as const },
    { key: 'planejamento_estrategico.plano_anual_contratacoes', dataKey: 'plano_anual_contratacoes' as const },
    { key: 'planejamento_estrategico.pdtic', dataKey: 'pdtic' as const },
    { key: 'planejamento_estrategico.entic_jud', dataKey: 'entic_jud' as const },
];

/**
 * Inicializa as seleções padrão (primeira sugestão para cada campo)
 */
function initSelections(): Record<string, FieldSelection> {
    const selections: Record<string, FieldSelection> = {};

    for (const key of SIMPLE_FIELDS) {
        selections[key] = { fieldKey: key, selectedIndex: 0, isEditing: false };
    }

    for (const { key } of PE_FIELDS) {
        selections[key] = { fieldKey: key, selectedIndex: 0, isEditing: false };
    }

    return selections;
}

/**
 * Página de resultado com sugestões editáveis e download em PDF.
 */
export default function ResultPage({ response, onReset, onConfirmEditing }: ResultPageProps) {
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

    /**
     * Limpa o texto do PCA usando Regex para manter apenas "PCA XXX"
     */
    const cleanPcaText = (text: string) => {
        const match = text.match(/PCA\s+\d+/i);
        return match ? match[0].toUpperCase() : text;
    };

    const handleExport = (format: 'pdf' | 'docx' | 'odt') => {
        exportDocument(format, 'DOD');
        setShowExportMenu(false);
    };

    const handleConfirmEditing = () => {
        onConfirmEditing?.(selections);
    };

    const exportActions = (
        <div className="export-menu-container">
            <button
                className="btn btn--success btn--lg"
                onClick={() => setShowExportMenu(!showExportMenu)}
                id="btn-export-main"
            >
                <FileOutput size={18} />
                Exportar
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
        <div className="result-page" id="result-page">
            <ApiConfigModal isOpen={isApiConfigOpen} onClose={() => setIsApiConfigOpen(false)} />

            <div className="result-page__header">
                <div className="result-page__badge">
                    <CheckCircle2 size={14} />
                    Sugestões Geradas com Sucesso
                </div>
                <h1 className="result-page__title">
                    Documento de Oficialização da Demanda
                </h1>
                <p className="result-page__description">
                    Revise as sugestões abaixo. Você pode selecionar a sugestão desejada ou
                    editar manualmente cada campo. Após a revisão, confirme a edição para gerar o Estudo Técnico Preliminar.
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
                        id="btn-new-demanda"
                    >
                        <RotateCcw size={16} />
                        Nova Demanda
                    </button>
                </div>
            </div>

            <div key={viewMode} className="view-fade-in">
                {viewMode === 'simplified' ? (
                    <>
                        {/* Campos simples */}
                        {SIMPLE_FIELDS.map((key) => {
                            let suggestions = response[key] || [];

                            // Regra TJGO: Para Nome, Data e PCA, mostrar apenas a primeira sugestão
                            if (key === 'nome_projeto' || key === 'data_envio' || key === 'identificacao_pca') {
                                const first = suggestions[0] || '';
                                // Aplicar Regex no PCA
                                const cleaned = key === 'identificacao_pca' ? cleanPcaText(first) : first;
                                suggestions = cleaned ? [cleaned] : [];
                            }

                            return (
                                <SuggestionField
                                    key={key}
                                    fieldKey={key}
                                    label={DOD_FIELD_LABELS[key] || key}
                                    suggestions={suggestions}
                                    selection={selections[key]}
                                    onSelectionChange={handleSelectionChange}
                                />
                            );
                        })}

                        {/* Planejamento Estratégico */}
                        <div className="pe-section">
                            <div className="pe-section__header">
                                <Landmark size={20} />
                                Planejamento Estratégico
                            </div>
                            <div className="pe-section__body">
                                {PE_FIELDS.map(({ key, dataKey }) => (
                                    <SuggestionField
                                        key={key}
                                        fieldKey={key}
                                        label={DOD_FIELD_LABELS[key] || key}
                                        suggestions={response.planejamento_estrategico[dataKey] || []}
                                        selection={selections[key]}
                                        onSelectionChange={handleSelectionChange}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <DocumentEditor
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
                    documentLabel="DOD"
                    onConfirmEditing={onConfirmEditing ? handleConfirmEditing : undefined}
                    confirmLabel="Confirmar Edição"
                />
            )}

            {/* Ações finais com botão Confirmar Edição */}
            <div className="result-page__actions result-page__actions--bottom">
                {exportActions}

                {onConfirmEditing && (
                    <button
                        className="btn btn--primary btn--lg btn--confirm-etp"
                        onClick={handleConfirmEditing}
                        id="btn-confirm-editing"
                    >
                        <CheckCircle2 size={18} />
                        Confirmar Edição
                        <ArrowRight size={18} />
                    </button>
                )}

                <button
                    className="btn btn--secondary"
                    onClick={onReset}
                    id="btn-new-demanda-bottom"
                >
                    <RotateCcw size={16} />
                    Nova Demanda
                </button>
            </div>
        </div>
    );
}
