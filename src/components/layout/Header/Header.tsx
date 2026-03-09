import { useState } from 'react';
import { Settings } from 'lucide-react';
import ApiConfigModal from '../../features/ApiConfigModal';

/**
 * Header principal do sistema - padrão Gov.br
 */
export default function Header() {
    const [showConfig, setShowConfig] = useState(false);

    return (
        <>
            <header className="header">
                <div className="header__content">
                    <div className="header__brand">
                        <div className="header__logo">S</div>
                        <div>
                            <div className="header__title">SIMPATIC - Sistema de Recomendações de Aquisições de TIC</div>
                            <div className="header__subtitle">
                                Poder Judiciário do Estado de Goiás
                            </div>
                        </div>
                    </div>

                    <div className="header__actions">
                        <button
                            className="header__config-btn"
                            onClick={() => setShowConfig(true)}
                            title="Configurar API"
                            id="btn-config-api"
                        >
                            <Settings size={16} />

                        </button>
                    </div>
                </div>
            </header>

            <ApiConfigModal isOpen={showConfig} onClose={() => setShowConfig(false)} />
        </>
    );
}
