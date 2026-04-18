import { useState, useCallback, useEffect } from 'react';
import {
    ClipboardCheck,
    X,
    BarChart3,
    Star,
    MessageSquareText,
    Send,
    CheckCircle2,
    AlertCircle,
    Target,
    ShieldCheck,
    FileCheck2,
    Sparkles,
    BookOpen,
} from 'lucide-react';
import type { EvaluationFormData, DocumentEvaluationPayload } from '../../../types';
import { 
    DOD_SECTION_MAPPING, 
    DOD_FIELD_LABELS, 
    ETP_FIELD_LABELS, 
    TR_FIELD_LABELS 
} from '../../../config/constants';
import { submitEvaluation, DuplicateEvaluationError } from '../../../api/evaluationService';
import './EvaluationPanel.css';

interface EvaluationPanelProps {
    /** Campo ativo no editor */
    fieldKey: string | null;
    /** trace_id da sessão de geração */
    traceId: string | null;
    /** Callback para fechar o painel */
    onClose: () => void;
    /** Offset Y para acompanhar posição do campo */
    offsetY: number;
    /** Tipo do documento sendo avaliado */
    documentType: 'DOD' | 'ETP' | 'TR';
}

/** Estado inicial do formulário */
const INITIAL_FORM: EvaluationFormData = {
    is_context_relevant: null,
    is_answer_faithful: null,
    is_answer_relevant: null,
    score_strategic_alignment: 0,
    score_clarity: 0,
    expert_comments: '',
};

/**
 * Painel lateral de Avaliação Humana (Ground Truth) — Métricas ARES.
 * Substitui a SuggestionsSidebar na tela do DOD.
 */
export default function EvaluationPanel({
    fieldKey,
    traceId,
    onClose,
    offsetY,
    documentType,
}: EvaluationPanelProps) {
    const [form, setForm] = useState<EvaluationFormData>({ ...INITIAL_FORM });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [hoveredStar, setHoveredStar] = useState<{ field: string; value: number } | null>(null);

    // Limpar formulário ao trocar de seção
    useEffect(() => {
        setForm({ ...INITIAL_FORM });
        setStatus('idle');
        setErrorMessage('');
    }, [fieldKey]);

    let sectionLabel = '';
    let sectionNameForBackend: string | null = null;

    if (fieldKey) {
        if (documentType === 'DOD') {
            sectionLabel = DOD_FIELD_LABELS[fieldKey] || DOD_SECTION_MAPPING[fieldKey] || fieldKey;
            sectionNameForBackend = DOD_SECTION_MAPPING[fieldKey] || null;
        } else if (documentType === 'ETP') {
            sectionLabel = ETP_FIELD_LABELS[fieldKey] || fieldKey;
            sectionNameForBackend = sectionLabel;
        } else if (documentType === 'TR') {
            sectionLabel = TR_FIELD_LABELS[fieldKey] || fieldKey;
            sectionNameForBackend = sectionLabel;
        }
    }

    /** Verifica se todos os campos obrigatórios estão preenchidos */
    const isFormValid =
        form.is_context_relevant !== null &&
        form.is_answer_faithful !== null &&
        form.is_answer_relevant !== null &&
        form.score_strategic_alignment >= 1 &&
        form.score_clarity >= 1;

    /** Atualiza campo binário */
    const setBinary = useCallback(
        (field: keyof Pick<EvaluationFormData, 'is_context_relevant' | 'is_answer_faithful' | 'is_answer_relevant'>, value: 0 | 1) => {
            setForm(prev => ({ ...prev, [field]: value }));
        },
        []
    );

    /** Atualiza estrelas */
    const setStars = useCallback(
        (field: 'score_strategic_alignment' | 'score_clarity', value: number) => {
            setForm(prev => ({ ...prev, [field]: value }));
        },
        []
    );

    /** Envia avaliação */
    const handleSubmit = useCallback(async () => {
        if (!isFormValid || !traceId || !sectionNameForBackend) return;

        setStatus('loading');
        setErrorMessage('');

        const payload: DocumentEvaluationPayload = {
            trace_id: traceId,
            section_name: sectionNameForBackend,
            document_type: documentType,
            evaluator_id: 'matr_tjgo_12345',
            is_context_relevant: form.is_context_relevant!,
            is_answer_faithful: form.is_answer_faithful!,
            is_answer_relevant: form.is_answer_relevant!,
            score_strategic_alignment: form.score_strategic_alignment as 1 | 2 | 3 | 4 | 5,
            score_clarity: form.score_clarity as 1 | 2 | 3 | 4 | 5,
            expert_comments: form.expert_comments,
        };

        try {
            await submitEvaluation(payload);
            setStatus('success');
            // Limpar formulário após 2s de feedback
            setTimeout(() => {
                setForm({ ...INITIAL_FORM });
                setStatus('idle');
            }, 3000);
        } catch (err) {
            if (err instanceof DuplicateEvaluationError) {
                setErrorMessage(err.message);
            } else {
                setErrorMessage(
                    err instanceof Error ? err.message : 'Erro ao enviar avaliação.'
                );
            }
            setStatus('error');
            setTimeout(() => {
                setStatus('idle');
            }, 3000);
        }
    }, [isFormValid, traceId, sectionNameForBackend, documentType, form]);

    // Se não há campo ativo
    if (!fieldKey || !sectionNameForBackend) {
        return (
            <aside
                className="evaluation-panel"
                style={fieldKey ? { marginTop: `${Math.max(0, offsetY - 16)}px` } : undefined}
            >
                <div className="evaluation-panel__header">
                    <div className="evaluation-panel__header-info">
                        <span className="evaluation-panel__badge">
                            <ClipboardCheck size={12} />
                            Avaliação Humana
                        </span>
                    </div>
                    <button
                        type="button"
                        className="evaluation-panel__close-btn"
                        onClick={onClose}
                        aria-label="Fechar painel de avaliação"
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className="evaluation-panel__empty">
                    <ClipboardCheck size={40} />
                    <p>
                        Clique em um <strong>campo do documento</strong> para avaliar
                        a qualidade da resposta gerada pela I.A.
                    </p>
                </div>
            </aside>
        );
    }

    return (
        <aside
            className="evaluation-panel"
            style={{ marginTop: `${Math.max(0, offsetY - 16)}px` }}
            role="form"
            aria-label={`Formulário de avaliação para ${sectionLabel}`}
        >
            {/* Header */}
            <div className="evaluation-panel__header">
                <div className="evaluation-panel__header-info">
                    <span className="evaluation-panel__badge">
                        <ClipboardCheck size={12} />
                        Avaliação Humana
                    </span>
                    <span className="evaluation-panel__section-name" title={sectionLabel}>
                        {sectionLabel}
                    </span>
                </div>
                <button
                    type="button"
                    className="evaluation-panel__close-btn"
                    onClick={onClose}
                    aria-label="Fechar painel de avaliação"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="evaluation-panel__body">
                {/* Feedback Toast */}
                {status === 'success' && (
                    <div className="evaluation-toast evaluation-toast--success" role="alert">
                        <CheckCircle2 size={18} />
                        Avaliação enviada com sucesso!
                    </div>
                )}
                {status === 'error' && (
                    <div className="evaluation-toast evaluation-toast--error" role="alert">
                        <AlertCircle size={18} />
                        {errorMessage}
                    </div>
                )}

                {(status === 'idle' || status === 'loading') && (
                    <>
                        {/* Métricas Binárias */}
                        <div className="evaluation-section">
                    <div className="evaluation-section__title">
                        <BarChart3 size={16} />
                        Métricas Binárias
                    </div>

                    <BinaryMetric
                        label="Relevância do Contexto"
                        sublabel="O contexto recuperado foi útil?"
                        icon={<Target size={14} />}
                        value={form.is_context_relevant}
                        onChange={(v) => setBinary('is_context_relevant', v)}
                    />
                    <BinaryMetric
                        label="Fidelidade"
                        sublabel="A resposta é fiel ao contexto?"
                        icon={<ShieldCheck size={14} />}
                        value={form.is_answer_faithful}
                        onChange={(v) => setBinary('is_answer_faithful', v)}
                    />
                    <BinaryMetric
                        label="Relevância da Resposta"
                        sublabel="A resposta atende à demanda?"
                        icon={<FileCheck2 size={14} />}
                        value={form.is_answer_relevant}
                        onChange={(v) => setBinary('is_answer_relevant', v)}
                    />
                </div>

                <div className="evaluation-divider" />

                {/* Escala Likert */}
                <div className="evaluation-section">
                    <div className="evaluation-section__title">
                        <Star size={16} />
                        Escala Likert
                    </div>

                    <LikertMetric
                        label="Alinhamento Estratégico"
                        icon={<Sparkles size={14} />}
                        value={form.score_strategic_alignment}
                        hoveredValue={hoveredStar?.field === 'strategic' ? hoveredStar.value : 0}
                        onChange={(v) => setStars('score_strategic_alignment', v)}
                        onHover={(v) => setHoveredStar(v ? { field: 'strategic', value: v } : null)}
                    />
                    <LikertMetric
                        label="Clareza e Coesão"
                        icon={<BookOpen size={14} />}
                        value={form.score_clarity}
                        hoveredValue={hoveredStar?.field === 'clarity' ? hoveredStar.value : 0}
                        onChange={(v) => setStars('score_clarity', v)}
                        onHover={(v) => setHoveredStar(v ? { field: 'clarity', value: v } : null)}
                    />
                </div>

                <div className="evaluation-divider" />

                {/* Comentários */}
                <div className="evaluation-section">
                    <div className="evaluation-section__title">
                        <MessageSquareText size={16} />
                        Comentários do Especialista
                    </div>
                    <textarea
                        className="evaluation-comments__textarea"
                        value={form.expert_comments}
                        onChange={(e) => setForm(prev => ({ ...prev, expert_comments: e.target.value }))}
                        placeholder="Observações adicionais sobre a qualidade desta seção... (opcional)"
                        id="evaluation-expert-comments"
                        aria-label="Comentários do especialista"
                    />
                </div>

                {/* Submit */}
                <button
                    type="button"
                    className={`evaluation-panel__submit ${status === 'loading' ? 'evaluation-panel__submit--loading' : ''}`}
                    onClick={handleSubmit}
                    disabled={!isFormValid || status === 'loading'}
                    id="btn-submit-evaluation"
                    aria-label="Enviar avaliação"
                >
                    {status === 'loading' ? (
                        <>
                            <span className="evaluation-spinner" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <Send size={16} />
                            Enviar Avaliação
                        </>
                    )}
                </button>
                    </>
                )}
            </div>
        </aside>
    );
}

/* ============================================
   Sub-components
   ============================================ */

interface BinaryMetricProps {
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    value: 0 | 1 | null;
    onChange: (value: 0 | 1) => void;
}

function BinaryMetric({ label, sublabel, icon, value, onChange }: BinaryMetricProps) {
    return (
        <div className="binary-metric" role="radiogroup" aria-label={label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                <span style={{ color: 'var(--gov-blue-primary)', flexShrink: 0 }}>{icon}</span>
                <div>
                    <div className="binary-metric__label">{label}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', marginTop: '0.1rem' }}>
                        {sublabel}
                    </div>
                </div>
            </div>
            <div className="binary-metric__toggles">
                <button
                    type="button"
                    className={`binary-metric__btn binary-metric__btn--yes ${value === 1 ? 'binary-metric__btn--active' : ''}`}
                    onClick={() => onChange(1)}
                    role="radio"
                    aria-checked={value === 1}
                    aria-label={`${label}: Sim`}
                >
                    Sim
                </button>
                <button
                    type="button"
                    className={`binary-metric__btn binary-metric__btn--no ${value === 0 ? 'binary-metric__btn--active' : ''}`}
                    onClick={() => onChange(0)}
                    role="radio"
                    aria-checked={value === 0}
                    aria-label={`${label}: Não`}
                >
                    Não
                </button>
            </div>
        </div>
    );
}

interface LikertMetricProps {
    label: string;
    icon: React.ReactNode;
    value: number;
    hoveredValue: number;
    onChange: (value: number) => void;
    onHover: (value: number | null) => void;
}

function LikertMetric({ label, icon, value, hoveredValue, onChange, onHover }: LikertMetricProps) {
    return (
        <div className="likert-metric">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--gov-blue-primary)' }}>{icon}</span>
                <span className="likert-metric__label">{label}</span>
                {value > 0 && (
                    <span className="likert-metric__value">{value}/5</span>
                )}
            </div>
            <div
                className="likert-metric__stars"
                role="radiogroup"
                aria-label={`${label} - selecione de 1 a 5`}
                onMouseLeave={() => onHover(null)}
            >
                {[1, 2, 3, 4, 5].map((starNum) => {
                    const isFilled = starNum <= value;
                    const isHovered = hoveredValue > 0 && starNum <= hoveredValue;

                    return (
                        <button
                            key={starNum}
                            type="button"
                            className={`likert-metric__star ${isFilled ? 'likert-metric__star--filled' : ''} ${isHovered && !isFilled ? 'likert-metric__star--hovered' : ''}`}
                            onClick={() => onChange(starNum)}
                            onMouseEnter={() => onHover(starNum)}
                            role="radio"
                            aria-checked={starNum === value}
                            aria-label={`${starNum} estrela${starNum > 1 ? 's' : ''}`}
                        >
                            <Star size={22} fill={isFilled || isHovered ? 'currentColor' : 'none'} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
