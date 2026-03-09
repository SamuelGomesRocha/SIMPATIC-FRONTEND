import { useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import {
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Palette,
} from 'lucide-react';

/**
 * Famílias de fontes básicas disponíveis no toolbar.
 * Inclui fontes web-safe que não requerem carregamento externo.
 */
const FONT_FAMILIES = [
    { label: 'Times New Roman', value: 'Times New Roman, serif' },
    { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
    { label: 'Courier New', value: 'Courier New, monospace' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { label: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
    { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
    { label: 'Calibri', value: 'Calibri, Candara, sans-serif' },
];

/**
 * Tamanhos de fonte disponíveis (em px).
 */
const FONT_SIZES = [
    '8px', '9px', '10px', '11px', '12px', '14px',
    '16px', '18px', '20px', '24px', '28px', '36px', '48px', '72px',
];

interface EditorToolbarProps {
    /** Instância do editor Tiptap */
    editor: Editor;
}

/**
 * Barra de ferramentas de edição avançada para os editores de documentos.
 *
 * Componente reutilizável que oferece controles de formatação de texto:
 * - Família de fonte (select)
 * - Tamanho de fonte (select)
 * - Negrito, itálico, sublinhado (toggle buttons)
 * - Cor da fonte (color picker)
 * - Alinhamento do texto (esquerda, centro, direita, justificado)
 *
 * @example
 * ```tsx
 * <EditorToolbar editor={editor} />
 * ```
 */
export default function EditorToolbar({ editor }: EditorToolbarProps) {
    // ==============================================================
    // Handlers
    // ==============================================================

    const handleFontFamilyChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const value = e.target.value;
            if (value) {
                editor.chain().focus().setFontFamily(value).run();
            } else {
                editor.chain().focus().unsetFontFamily().run();
            }
        },
        [editor]
    );

    const handleFontSizeChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const value = e.target.value;
            if (value) {
                (editor.chain().focus() as any).setFontSize(value).run();
            } else {
                (editor.chain().focus() as any).unsetFontSize().run();
            }
        },
        [editor]
    );

    const handleColorChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            editor.chain().focus().setColor(e.target.value).run();
        },
        [editor]
    );

    // ==============================================================
    // Leitura do estado ativo do editor
    // ==============================================================

    const currentFontFamily =
        (editor.getAttributes('textStyle').fontFamily as string) || '';

    const currentFontSize =
        (editor.getAttributes('textStyle').fontSize as string) || '';

    const currentColor =
        (editor.getAttributes('textStyle').color as string) || '#000000';

    // ==============================================================
    // Render
    // ==============================================================

    return (
        <div className="editor-toolbar" role="toolbar" aria-label="Formatação de texto">
            {/* ---- Grupo: Fonte ---- */}
            <div className="editor-toolbar__group">
                <select
                    className="editor-toolbar__select editor-toolbar__select--font"
                    value={currentFontFamily}
                    onChange={handleFontFamilyChange}
                    title="Família da fonte"
                    aria-label="Família da fonte"
                >
                    <option value="">Fonte padrão</option>
                    {FONT_FAMILIES.map((f) => (
                        <option key={f.value} value={f.value}>
                            {f.label}
                        </option>
                    ))}
                </select>

                <select
                    className="editor-toolbar__select editor-toolbar__select--size"
                    value={currentFontSize}
                    onChange={handleFontSizeChange}
                    title="Tamanho da fonte"
                    aria-label="Tamanho da fonte"
                >
                    <option value="">Tamanho</option>
                    {FONT_SIZES.map((s) => (
                        <option key={s} value={s}>
                            {parseInt(s, 10)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="editor-toolbar__separator" role="separator" />

            {/* ---- Grupo: Tipografia ---- */}
            <div className="editor-toolbar__group">
                <button
                    type="button"
                    className={`editor-toolbar__btn ${editor.isActive('bold') ? 'editor-toolbar__btn--active' : ''}`}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    title="Negrito (Ctrl+B)"
                    aria-label="Negrito"
                    aria-pressed={editor.isActive('bold')}
                >
                    <Bold size={16} />
                </button>
                <button
                    type="button"
                    className={`editor-toolbar__btn ${editor.isActive('italic') ? 'editor-toolbar__btn--active' : ''}`}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    title="Itálico (Ctrl+I)"
                    aria-label="Itálico"
                    aria-pressed={editor.isActive('italic')}
                >
                    <Italic size={16} />
                </button>
                <button
                    type="button"
                    className={`editor-toolbar__btn ${editor.isActive('underline') ? 'editor-toolbar__btn--active' : ''}`}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    title="Sublinhado (Ctrl+U)"
                    aria-label="Sublinhado"
                    aria-pressed={editor.isActive('underline')}
                >
                    <Underline size={16} />
                </button>
            </div>

            <div className="editor-toolbar__separator" role="separator" />

            {/* ---- Grupo: Cor ---- */}
            <div className="editor-toolbar__group">
                <label className="editor-toolbar__color-label" title="Cor da fonte" aria-label="Cor da fonte">
                    <Palette size={16} />
                    <input
                        type="color"
                        className="editor-toolbar__color-input"
                        value={currentColor}
                        onChange={handleColorChange}
                        aria-label="Selecionar cor da fonte"
                    />
                </label>
            </div>

            <div className="editor-toolbar__separator" role="separator" />

            {/* ---- Grupo: Alinhamento ---- */}
            <div className="editor-toolbar__group">
                <button
                    type="button"
                    className={`editor-toolbar__btn ${editor.isActive({ textAlign: 'left' }) ? 'editor-toolbar__btn--active' : ''}`}
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    title="Alinhar à esquerda"
                    aria-label="Alinhar à esquerda"
                >
                    <AlignLeft size={16} />
                </button>
                <button
                    type="button"
                    className={`editor-toolbar__btn ${editor.isActive({ textAlign: 'center' }) ? 'editor-toolbar__btn--active' : ''}`}
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    title="Centralizar"
                    aria-label="Centralizar"
                >
                    <AlignCenter size={16} />
                </button>
                <button
                    type="button"
                    className={`editor-toolbar__btn ${editor.isActive({ textAlign: 'right' }) ? 'editor-toolbar__btn--active' : ''}`}
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    title="Alinhar à direita"
                    aria-label="Alinhar à direita"
                >
                    <AlignRight size={16} />
                </button>
                <button
                    type="button"
                    className={`editor-toolbar__btn ${editor.isActive({ textAlign: 'justify' }) ? 'editor-toolbar__btn--active' : ''}`}
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    title="Justificar"
                    aria-label="Justificar"
                >
                    <AlignJustify size={16} />
                </button>
            </div>
        </div>
    );
}
