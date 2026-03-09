import { useState } from 'react';
import {
    FileOutput,
    FileText,
    FileType,
    RotateCcw,
    ArrowRight,
    CheckCircle2,
} from 'lucide-react';

interface FloatingActionsProps {
    /** Função para exportar nos formatos PDF, DOCX ou ODT */
    onExport: (format: 'pdf' | 'docx' | 'odt') => void;
    /** Função para resetar e iniciar nova demanda */
    onReset: () => void;
    /** Rótulo do documento (ex: "DOD", "ETP", "TR") */
    documentLabel?: string;
    /** Callback para confirmar edição e ir à próxima etapa (opcional) */
    onConfirmEditing?: () => void;
    /** Rótulo do botão de próxima etapa */
    confirmLabel?: string;
}

/**
 * Painel lateral flutuante com botões de ação (Exportar, Nova Demanda, Próxima Etapa).
 *
 * Posicionado com `position: fixed` à esquerda do viewport, visível apenas
 * no modo "Edição Avançada". Permite que o usuário acesse as ações principais
 * sem precisar rolar a página.
 */
export default function FloatingActions({
    onExport,
    onReset,
    documentLabel = '',
    onConfirmEditing,
    confirmLabel = 'Próxima Etapa',
}: FloatingActionsProps) {
    const [showExportMenu, setShowExportMenu] = useState(false);

    return (
        <div className="floating-actions" role="toolbar" aria-label="Ações do documento">
            {/* Exportar */}
            <div className="floating-actions__item-wrapper">
                <button
                    type="button"
                    className="floating-actions__btn floating-actions__btn--export"
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    title={`Exportar ${documentLabel}`}
                    aria-label={`Exportar ${documentLabel}`}
                    aria-expanded={showExportMenu}
                >
                    <FileOutput size={20} />
                </button>
                {showExportMenu && (
                    <div className="floating-actions__dropdown">
                        <button onClick={() => { onExport('pdf'); setShowExportMenu(false); }}>
                            <FileText size={14} /> PDF
                        </button>
                        <button onClick={() => { onExport('docx'); setShowExportMenu(false); }}>
                            <FileType size={14} /> DOCX
                        </button>
                        <button onClick={() => { onExport('odt'); setShowExportMenu(false); }}>
                            <FileType size={14} /> ODT
                        </button>
                    </div>
                )}
            </div>

            {/* Nova Demanda */}
            <button
                type="button"
                className="floating-actions__btn floating-actions__btn--reset"
                onClick={onReset}
                title="Nova Demanda"
                aria-label="Nova Demanda"
            >
                <RotateCcw size={20} />
            </button>

            {/* Próxima Etapa / Confirmar Edição */}
            {onConfirmEditing && (
                <button
                    type="button"
                    className="floating-actions__btn floating-actions__btn--confirm"
                    onClick={onConfirmEditing}
                    title={confirmLabel}
                    aria-label={confirmLabel}
                >
                    {confirmLabel.toLowerCase().includes('confirmar') ? (
                        <CheckCircle2 size={20} />
                    ) : (
                        <ArrowRight size={20} />
                    )}
                </button>
            )}
        </div>
    );
}
