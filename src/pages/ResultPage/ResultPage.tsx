import { useState } from 'react';
import { RotateCcw, CheckCircle2, Settings, FileText, FileType, FileOutput, LayoutGrid, ArrowRight, ClipboardList, Target } from 'lucide-react';
import ApiConfigModal from '../../components/features/ApiConfigModal';
import DocumentEditor from '../../components/features/DocumentEditor';
import FloatingActions from '../../components/features/DocumentEditor/FloatingActions';
import type { DODResponse, FieldSelection, SuggestionItem } from '../../types';
import { DOD_FIELD_LABELS } from '../../config/constants';
import { exportDocument, generatePopulatedHtml } from '../../utils/exportService';
import { getDODStandardText } from '../../config/standardTexts';
import SuggestionField from '../../components/ui/SuggestionField';

interface ResultPageProps {
    response: DODResponse;
    onReset: () => void;
    onConfirmEditing?: (selections: Record<string, FieldSelection>) => void;
    /** trace_id da sessão de geração do DOD (habilita avaliação humana) */
    traceId?: string | null;
}

/** Seção 1: Documento de Oficialização da Demanda */
const SECTION_DOD_FIELDS = [
    'nome_projeto',
    'data_envio',
    'identificacao_pca',
    'fonte_recurso',
    'alinhamento_loa',
] as const;

/** Seção 2: Motivação, Justificativa e Resultados */
const SECTION_MOTIVATION_FIELDS = [
    'motivacao_justificativa',
    'resultados_beneficios',
] as const;

/** Campos do Planejamento Estratégico */

/**
 * Inicializa as seleções padrão (primeira sugestão para cada campo)
 */
function initSelections(): Record<string, FieldSelection> {
    const selections: Record<string, FieldSelection> = {};

    const allSimpleFields = [...SECTION_DOD_FIELDS, ...SECTION_MOTIVATION_FIELDS];
    for (const key of allSimpleFields) {
        selections[key] = { fieldKey: key, selectedIndex: 0, isEditing: false };
    }

    // Campo agregado do Planejamento Estratégico
    selections['planejamento_estrategico'] = { fieldKey: 'planejamento_estrategico', selectedIndex: 0, isEditing: false };

    return selections;
}

/**
 * Página de resultado com sugestões editáveis e download em PDF.
 */
export default function ResultPage({ response, onReset, onConfirmEditing, traceId }: ResultPageProps) {
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

    /**
     * Limpa o texto do PCA usando Regex para manter apenas "PCA XXX"
     */
    const cleanPcaText = (text: string) => {
        const match = text.match(/PCA\s+\d+/i);
        return match ? match[0].toUpperCase() : text;
    };

    const handleExport = (format: 'pdf' | 'docx' | 'odt') => {
        if (viewMode === 'simplified') {
            const html = generatePopulatedHtml('DOD', response, selections);
            exportDocument(format, 'DOD', html);
        } else {
            exportDocument(format, 'DOD');
        }
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
                            <CheckCircle2 size={18} /> Confirmar Edição e Gerar ETP
                        </button>
                    )}
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
                        {/* Função auxiliar para renderizar cada campo com suas regras específicas */}
                        {(() => {
                            const renderField = (key: string) => {
                                let suggestions: string[] = [];
                                if (key === 'planejamento_estrategico') {
                                    // Agregação visual dos 4 campos do PE
                                    const pg = response.planejamento_estrategico.plano_gestao || [];
                                    const pac = response.planejamento_estrategico.plano_anual_contratacoes || [];
                                    const pdtic = response.planejamento_estrategico.pdtic || [];
                                    const entic = response.planejamento_estrategico.entic_jud || [];
                                    
                                    const maxLength = Math.max(pg.length, pac.length, pdtic.length, entic.length);
                                    for (let i = 0; i < maxLength; i++) {
                                        const combined = [
                                            pg[i], pac[i], pdtic[i], entic[i]
                                        ].filter(Boolean).join('\n\n');
                                        if (combined) suggestions.push(combined);
                                    }
                                } else {
                                    suggestions = response[key as keyof DODResponse] as string[] || [];
                                }

                                // Regra TJGO: Para Nome, Data e PCA, mostrar apenas a primeira sugestão
                                if (key === 'nome_projeto' || key === 'data_envio' || key === 'identificacao_pca') {
                                    const first = suggestions[0] || '';
                                    // Aplicar Regex no PCA
                                    const cleaned = key === 'identificacao_pca' ? cleanPcaText(first) : first;
                                    suggestions = cleaned ? [cleaned] : [];
                                }

                                // Formatação para Resultados e Benefícios: quebra de linha em itens (a), b), etc.)
                                if (key === 'resultados_beneficios') {
                                    suggestions = suggestions.map(s => 
                                        s.replace(/(;\s*|\s+)(?=[a-z]\))/gi, (match) => {
                                            return match.includes(';') ? ';\n' : '\n';
                                        }).trim()
                                    );
                                }

                                // Enriquecer com sugestões da IA
                                const enrichedSuggestions: SuggestionItem[] = suggestions.map(
                                    text => ({ text, source: 'ai' as const })
                                );

                                // Tentar obter texto padrão (StandardText)
                                const standardText = getDODStandardText(key);
                                if (standardText) {
                                    enrichedSuggestions.push({ text: standardText, source: 'standard' });
                                }

                                return (
                                    <SuggestionField
                                        key={key}
                                        fieldKey={key}
                                        label={DOD_FIELD_LABELS[key] || key}
                                        suggestions={enrichedSuggestions}
                                        selection={selections[key]}
                                        onSelectionChange={handleSelectionChange}
                                        traceId={traceId}
                                        documentType="DOD"
                                    />
                                );
                            };

                            return (
                                <>
                                    {/* Seção 1: Documento de Oficialização da Demanda */}
                                    <div className="pe-section pe-section--blue">
                                        <div className="pe-section__header">
                                            <ClipboardList size={20} />
                                            Documento de Oficialização da Demanda
                                        </div>
                                        <div className="pe-section__body">
                                            {SECTION_DOD_FIELDS.map(renderField)}
                                        </div>
                                    </div>

                                    {/* Seção 2: Motivação, Justificativa e Resultados */}
                                    <div className="pe-section pe-section--blue">
                                        <div className="pe-section__header">
                                            <Target size={20} />
                                            Motivação, Justificativa e Resultados
                                        </div>
                                        <div className="pe-section__body">
                                            {SECTION_MOTIVATION_FIELDS.map(renderField)}
                                        </div>
                                    </div>

                                    {/* Seção 3: Planejamento Estratégico (Agregado) */}
                                    <div className="pe-section pe-section--blue">
                                        <div className="pe-section__header">
                                            <FileType size={20} />
                                            Planejamento Estratégico
                                        </div>
                                        <div className="pe-section__body">
                                            {renderField('planejamento_estrategico')}
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </>
                ) : (
                    <DocumentEditor 
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
                documentLabel="DOD"
                onConfirmEditing={onConfirmEditing ? handleConfirmEditing : undefined}
                confirmLabel="Confirmar Edição"
            />

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
