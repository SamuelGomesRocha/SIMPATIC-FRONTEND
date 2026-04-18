import { useState, useRef } from 'react';
import { Send, ClipboardList, UploadCloud, X, File as FileIcon } from 'lucide-react';
import { maskCurrency } from '../../utils/helpers';
import type { DemandaInput, ContractMode } from '../../types';
import {
    GRAU_PRIORIDADE_OPTIONS,
    MODELO_OPTIONS,
    INVESTIMENTO_CUSTEIO_OPTIONS,
    MESES_OPTIONS,
} from '../../config/constants';

interface FormPageProps {
    onSubmit: (data: DemandaInput) => void;
    onSubmitStandard: (files: { dod: File; etp: File; tr: File }) => void;
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

interface UploadFiles {
    dod: File | null;
    etp: File | null;
    tr: File | null;
}

export default function FormPage({ onSubmit, onSubmitStandard }: FormPageProps) {
    const [contractMode, setContractMode] = useState<ContractMode>('nova');
    const [form, setForm] = useState<DemandaInput>(INITIAL_FORM);
    const [files, setFiles] = useState<UploadFiles>({ dod: null, etp: null, tr: null });

    const dodInputRef = useRef<HTMLInputElement>(null);
    const etpInputRef = useRef<HTMLInputElement>(null);
    const trInputRef = useRef<HTMLInputElement>(null);

    const updateField = (field: keyof DemandaInput, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileSelect = (docType: keyof UploadFiles) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setFiles(prev => ({ ...prev, [docType]: file }));
        } else if (file) {
            alert('Por favor, selecione apenas arquivos PDF.');
            if (e.target) e.target.value = '';
        }
    };

    const removeFile = (docType: keyof UploadFiles) => (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setFiles(prev => ({ ...prev, [docType]: null }));
        if (docType === 'dod' && dodInputRef.current) dodInputRef.current.value = '';
        if (docType === 'etp' && etpInputRef.current) etpInputRef.current.value = '';
        if (docType === 'tr' && trInputRef.current) trInputRef.current.value = '';
    };

    const isValidDemanda = () => {
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

    const isValidStandard = () => files.dod !== null && files.etp !== null && files.tr !== null;

    const handleDemandaSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isValidDemanda()) onSubmit(form);
    };

    const handleStandardSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isValidStandard()) {
            onSubmitStandard({
                dod: files.dod as File,
                etp: files.etp as File,
                tr: files.tr as File
            });
        }
    };

    return (
        <div className="form-page" id="form-page">

            {/* Toggle de Modo Contratação */}
            <div className="contract-mode-toggle">
                <button
                    type="button"
                    className={`contract-mode-toggle__option ${contractMode === 'nova' ? 'contract-mode-toggle__option--active' : ''}`}
                    onClick={() => setContractMode('nova')}
                >
                    Nova Contratação
                </button>
                <button
                    type="button"
                    className={`contract-mode-toggle__option ${contractMode === 'repetida' ? 'contract-mode-toggle__option--active' : ''}`}
                    onClick={() => setContractMode('repetida')}
                >
                    Contratação Recorrente
                </button>
            </div>

            {/* MODO 1: Nova Contratação (RAG Simpatic) */}
            {contractMode === 'nova' && (
                <form className="form-card" onSubmit={handleDemandaSubmit} key="form-nova">
                    <h2 className="form-card__section-title">
                        <ClipboardList size={20} />
                        Dados do PCA
                    </h2>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="field-pca">
                                PCA (Identificador) <span className="required">*</span>
                            </label>
                            <input
                                id="field-pca"
                                className="form-input"
                                type="text"
                                placeholder="Ex: PCA 251"
                                value={form.pca}
                                onChange={(e) => updateField('pca', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="field-demanda-unidade">
                                Demanda da Unidade <span className="required">*</span>
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
                                onChange={(e) => updateField('valor_estimado', maskCurrency(e.target.value))}
                                required
                            />
                        </div>
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
                        <div className="form-group">
                            <label htmlFor="field-data-prevista">
                                Data Prevista <span className="required">*</span>
                            </label>
                            <select
                                id="field-data-prevista"
                                className="form-select"
                                value={form.data_prevista ? form.data_prevista.split('/')[1] : ''}
                                onChange={(e) => updateField('data_prevista', e.target.value ? `01/${e.target.value}/2026` : '')}
                                required
                            >
                                <option value="">Selecione o mês...</option>
                                {MESES_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
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
                        <button type="submit" className="btn btn--primary btn--lg" disabled={!isValidDemanda()}>
                            <Send size={18} /> Gerar Sugestões para o DOD
                        </button>
                    </div>
                </form>
            )}

            {/* MODO 2: Contratação Repetida (Extração Híbrida) */}
            {contractMode === 'repetida' && (
                <form className="form-card" onSubmit={handleStandardSubmit} key="form-repetida">
                    <h2 className="form-card__section-title">
                        <UploadCloud size={20} />
                        Documentos Preexistentes
                    </h2>
                    <p className="form-page__description" style={{ marginBottom: '24px', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                        Selecione os arquivos em formato PDF correspondentes a cada documento. A Inteligência Artificial
                        lerá os textos e os organizará automaticamente dentro da estrutura padronizada do SIMPATIC.
                    </p>

                    <div className="upload-grid">
                        {/* Campo DOD */}
                        <label className={`upload-field ${files.dod ? 'upload-field--filled' : ''}`}>
                            <input ref={dodInputRef} type="file" accept="application/pdf" className="upload-field__input" onChange={handleFileSelect('dod')} />
                            <FileIcon size={32} className="upload-field__icon" />
                            {files.dod ? (
                                <>
                                    <span className="upload-field__label">Documento de Oficialização da Demanda (DOD)</span>
                                    <span className="upload-field__filename">{files.dod.name}</span>
                                    <button type="button" className="upload-field__remove" onClick={removeFile('dod')} title="Remover arquivo"><X size={14} /></button>
                                </>
                            ) : (
                                <>
                                    <span className="upload-field__label">Upload do DOD</span>
                                    <span className="upload-field__hint">Clique ou arraste um PDF aqui</span>
                                </>
                            )}
                        </label>

                        {/* Campo ETP */}
                        <label className={`upload-field ${files.etp ? 'upload-field--filled' : ''}`}>
                            <input ref={etpInputRef} type="file" accept="application/pdf" className="upload-field__input" onChange={handleFileSelect('etp')} />
                            <FileIcon size={32} className="upload-field__icon" />
                            {files.etp ? (
                                <>
                                    <span className="upload-field__label">Estudo Técnico Preliminar (ETP)</span>
                                    <span className="upload-field__filename">{files.etp.name}</span>
                                    <button type="button" className="upload-field__remove" onClick={removeFile('etp')} title="Remover arquivo"><X size={14} /></button>
                                </>
                            ) : (
                                <>
                                    <span className="upload-field__label">Upload do ETP</span>
                                    <span className="upload-field__hint">Clique ou arraste um PDF aqui</span>
                                </>
                            )}
                        </label>

                        {/* Campo TR */}
                        <label className={`upload-field ${files.tr ? 'upload-field--filled' : ''}`}>
                            <input ref={trInputRef} type="file" accept="application/pdf" className="upload-field__input" onChange={handleFileSelect('tr')} />
                            <FileIcon size={32} className="upload-field__icon" />
                            {files.tr ? (
                                <>
                                    <span className="upload-field__label">Termo de Referência (TR)</span>
                                    <span className="upload-field__filename">{files.tr.name}</span>
                                    <button type="button" className="upload-field__remove" onClick={removeFile('tr')} title="Remover arquivo"><X size={14} /></button>
                                </>
                            ) : (
                                <>
                                    <span className="upload-field__label">Upload do TR</span>
                                    <span className="upload-field__hint">Clique ou arraste um PDF aqui</span>
                                </>
                            )}
                        </label>
                    </div>

                    <div className="form-actions" style={{ marginTop: '32px' }}>
                        <button type="submit" className="btn btn--primary btn--lg" disabled={!isValidStandard()}>
                            <UploadCloud size={18} /> Iniciar Extração via Inteligência Artificial
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
