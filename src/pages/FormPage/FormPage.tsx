import { useState } from 'react';
import { Send, FileText, ClipboardList } from 'lucide-react';
import type { DemandaInput } from '../../types';
import {
    GRAU_PRIORIDADE_OPTIONS,
    MODELO_OPTIONS,
    INVESTIMENTO_CUSTEIO_OPTIONS,
} from '../../config/constants';

interface FormPageProps {
    onSubmit: (data: DemandaInput) => void;
}

const INITIAL_FORM: DemandaInput = {
    pca: '',
    demanda_unidade: '',
    grau_prioridade: '',
    justificativa: '',
    valor_estimado: '',
    modelo: '',
    data_prevista: '',
    investimento_custeio: '',
};

/**
 * Página do formulário de entrada - coleta os dados da demanda.
 */
export default function FormPage({ onSubmit }: FormPageProps) {
    const [form, setForm] = useState<DemandaInput>(INITIAL_FORM);

    const updateField = (field: keyof DemandaInput, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const isValid = () => {
        return (
            form.pca.trim() !== '' &&
            form.demanda_unidade.trim() !== '' &&
            form.grau_prioridade !== '' &&
            form.justificativa.trim() !== '' &&
            form.valor_estimado.trim() !== '' &&
            form.modelo !== '' &&
            form.data_prevista.trim() !== '' &&
            form.investimento_custeio !== ''
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isValid()) {
            onSubmit(form);
        }
    };

    return (
        <div className="form-page" id="form-page">
            <div className="form-page__header">
                <div className="form-page__badge">
                    <FileText size={14} />
                    SIMPATIC
                </div>
                <h1 className="form-page__title">
                    Nova Demanda de Contratação
                </h1>
                <p className="form-page__description">
                    Preencha os dados abaixo para gerar sugestões inteligentes para o
                    Documento de Oficialização da Demanda (DOD) conforme o Guia de
                    Melhores Práticas do CNJ.
                </p>
            </div>

            <form className="form-card" onSubmit={handleSubmit}>
                <h2 className="form-card__section-title">
                    <ClipboardList size={20} />
                    Dados da Demanda
                </h2>

                <div className="form-grid">
                    {/* PCA */}
                    <div className="form-group">
                        <label htmlFor="field-pca">
                            PCA (Identificador) <span className="required">*</span>
                        </label>
                        <input
                            id="field-pca"
                            className="form-input"
                            type="text"
                            placeholder="Ex: PCA-2026-001"
                            value={form.pca}
                            onChange={(e) => updateField('pca', e.target.value)}
                            required
                        />
                    </div>

                    {/* Demanda de Unidade */}
                    <div className="form-group">
                        <label htmlFor="field-demanda-unidade">
                            Demanda de Unidade <span className="required">*</span>
                        </label>
                        <input
                            id="field-demanda-unidade"
                            className="form-input"
                            type="text"
                            placeholder="Ex: Secretaria de TI"
                            value={form.demanda_unidade}
                            onChange={(e) => updateField('demanda_unidade', e.target.value)}
                            required
                        />
                    </div>

                    {/* Grau de Prioridade */}
                    <div className="form-group">
                        <label htmlFor="field-grau-prioridade">
                            Grau de Prioridade <span className="required">*</span>
                        </label>
                        <select
                            id="field-grau-prioridade"
                            className="form-select"
                            value={form.grau_prioridade}
                            onChange={(e) => updateField('grau_prioridade', e.target.value)}
                            required
                        >
                            <option value="">Selecione...</option>
                            {GRAU_PRIORIDADE_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Valor Estimado */}
                    <div className="form-group">
                        <label htmlFor="field-valor-estimado">
                            Valor Estimado <span className="required">*</span>
                        </label>
                        <input
                            id="field-valor-estimado"
                            className="form-input"
                            type="text"
                            placeholder="Ex: R$ 500.000,00"
                            value={form.valor_estimado}
                            onChange={(e) => updateField('valor_estimado', e.target.value)}
                            required
                        />
                    </div>

                    {/* Modelo */}
                    <div className="form-group">
                        <label htmlFor="field-modelo">
                            Modelo <span className="required">*</span>
                        </label>
                        <select
                            id="field-modelo"
                            className="form-select"
                            value={form.modelo}
                            onChange={(e) => updateField('modelo', e.target.value)}
                            required
                        >
                            <option value="">Selecione...</option>
                            {MODELO_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Data Prevista */}
                    <div className="form-group">
                        <label htmlFor="field-data-prevista">
                            Data Prevista <span className="required">*</span>
                        </label>
                        <input
                            id="field-data-prevista"
                            className="form-input"
                            type="date"
                            value={form.data_prevista}
                            onChange={(e) => updateField('data_prevista', e.target.value)}
                            required
                        />
                    </div>

                    {/* Investimento ou Custeio */}
                    <div className="form-group">
                        <label htmlFor="field-investimento-custeio">
                            Investimento ou Custeio <span className="required">*</span>
                        </label>
                        <select
                            id="field-investimento-custeio"
                            className="form-select"
                            value={form.investimento_custeio}
                            onChange={(e) => updateField('investimento_custeio', e.target.value)}
                            required
                        >
                            <option value="">Selecione...</option>
                            {INVESTIMENTO_CUSTEIO_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Justificativa */}
                    <div className="form-group form-group--full">
                        <label htmlFor="field-justificativa">
                            Justificativa <span className="required">*</span>
                        </label>
                        <textarea
                            id="field-justificativa"
                            className="form-textarea"
                            placeholder="Descreva a justificativa para esta contratação..."
                            value={form.justificativa}
                            onChange={(e) => updateField('justificativa', e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn btn--primary btn--lg"
                        disabled={!isValid()}
                        id="btn-submit"
                    >
                        <Send size={18} />
                        Gerar Sugestões para o DOD
                    </button>
                </div>
            </form>
        </div>
    );
}
