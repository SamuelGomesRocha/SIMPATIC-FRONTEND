import { useState } from 'react';
import { Settings, X, CheckCircle, Key, Cpu, Radio } from 'lucide-react';
import { getApiUrl, setApiUrl, getApiKey, setApiKey, getApiModel, setApiModel, getApiEnvironment, setApiEnvironment } from '../../../api/dodService';

interface ApiConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Modal para configuração da URL da API REST
 */
export default function ApiConfigModal({ isOpen, onClose }: ApiConfigModalProps) {
    const [url, setUrl] = useState(getApiUrl());
    const [apiKey, setApiKeyLocal] = useState(getApiKey());
    const [model, setModelLocal] = useState(getApiModel());
    const [environment, setEnvironment] = useState(getApiEnvironment());
    const [saved, setSaved] = useState(false);

    if (!isOpen) return null;

    const handleSave = () => {
        setApiUrl(url.replace(/\/+$/, '')); // Remove trailing slashes
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
                        <label htmlFor="api-url">
                            URL Base da API <span className="required">*</span>
                        </label>
                        <input
                            id="api-url"
                            type="url"
                            className="form-input"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="http://localhost:8000"
                            disabled={environment === 'homologacao'}
                        />
                        <span style={{ fontSize: '0.75rem', color: '#888', marginTop: 4 }}>
                            Endereço do servidor backend que processa as sugestões.
                        </span>
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
                            <option value="gemini-1.5-flash">gemini-1.5-flash (Padrão)</option>
                            <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                            <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite</option>
                        </select>
                        <span style={{ fontSize: '0.75rem', color: '#888', marginTop: 4 }}>
                            {environment === 'homologacao'
                                ? 'Desativado em modo de homologação.'
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
