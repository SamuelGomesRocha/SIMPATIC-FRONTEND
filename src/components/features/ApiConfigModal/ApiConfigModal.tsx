import { useState } from 'react';
import { Settings, X, CheckCircle, Key, Cpu, Radio } from 'lucide-react';
import { getApiKey, setApiKey, getApiModel, setApiModel, getApiEnvironment, setApiEnvironment } from '../../../api/dodService';
import { GEMINI_MODEL_OPTIONS } from '../../../config/constants';

interface ApiConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Modal para configuração da URL da API REST
 */
export default function ApiConfigModal({ isOpen, onClose }: ApiConfigModalProps) {
    const [apiKey, setApiKeyLocal] = useState(getApiKey());
    const [model, setModelLocal] = useState(getApiModel());
    const [environment, setEnvironment] = useState(getApiEnvironment());
    const [saved, setSaved] = useState(false);

    if (!isOpen) return null;

    const handleSave = () => {
        setApiKey(apiKey.trim());
        setApiModel(model);
        setApiEnvironment(environment);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <div className="modal__header">
                    <h2 className="modal__title" id="modal-title">
                        <Settings size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        Configuração
                    </h2>
                    <button className="modal__close" onClick={onClose} aria-label="Fechar modal">
                        <X size={20} />
                    </button>
                </div>

                <div className="modal__body">
                    <div className="form-group">
                        <label>
                            <Radio size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />
                            Ambiente do Sistema
                        </label>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'normal' }}>
                                <input
                                    type="radio"
                                    name="environment"
                                    value="producao"
                                    checked={environment === 'producao'}
                                    onChange={() => setEnvironment('producao')}
                                />
                                Produção
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'normal' }}>
                                <input
                                    type="radio"
                                    name="environment"
                                    value="homologacao"
                                    checked={environment === 'homologacao'}
                                    onChange={() => setEnvironment('homologacao')}
                                />
                                Homologação (Mock)
                            </label>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                        <label htmlFor="api-key" style={{ opacity: environment === 'homologacao' ? 0.5 : 1 }}>
                            <Key size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />
                            Chave de API do Gemini (Opcional)
                        </label>
                        <input
                            id="api-key"
                            type="password"
                            className="form-input"
                            value={apiKey}
                            onChange={(e) => setApiKeyLocal(e.target.value)}
                            placeholder="Digite sua chave de API aqui..."
                            disabled={environment === 'homologacao'}
                        />
                        <span style={{ fontSize: '0.75rem', color: '#888', marginTop: 4 }}>
                            {environment === 'homologacao'
                                ? 'Desativado em modo de homologação.'
                                : 'Sua chave será enviada ao backend para autenticação com o Gemini.'}
                        </span>
                    </div>

                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                        <label htmlFor="api-model" style={{ opacity: environment === 'homologacao' ? 0.5 : 1 }}>
                            <Cpu size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />
                            Modelo do Gemini
                        </label>
                        <select
                            id="api-model"
                            className="form-input"
                            value={model}
                            onChange={(e) => setModelLocal(e.target.value)}
                            disabled={environment === 'homologacao'}
                        >
                            {GEMINI_MODEL_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <span style={{ fontSize: '0.75rem', color: '#888', marginTop: 4 }}>
                            {environment === 'homologacao'
                                ? 'Desativado em modo de homologação.'
                                : model.includes('preview') 
                                    ? 'Este modelo está em fase de preview. O identificador utilizado será models/gemini-3.1-flash-lite-preview.'
                                    : 'Selecione o modelo que será utilizado para processar as sugestões.'}
                        </span>
                    </div>
                </div>

                <div className="modal__footer">
                    {saved && (
                        <span className="modal__saved-badge">
                            <CheckCircle size={14} /> Salvo!
                        </span>
                    )}
                    <button className="btn btn--ghost btn--sm" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="btn btn--primary btn--sm" onClick={handleSave}>
                        Salvar Configuração
                    </button>
                </div>
            </div>
        </div>
    );
}
