import { Extension } from '@tiptap/core';
import '@tiptap/extension-text-style';

/**
 * Extensão customizada para tamanho de fonte no Tiptap.
 *
 * Adiciona o atributo `fontSize` ao tipo `textStyle`, permitindo
 * parsear e renderizar `style="font-size: ..."` no HTML. Também
 * expõe comandos `setFontSize` e `unsetFontSize` para controle
 * programático do tamanho da fonte.
 */

// Declaração de módulos para estender as interfaces do Tiptap
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        fontSize: {
            /**
             * Define o tamanho da fonte para o texto selecionado.
             * @param size - Tamanho em string CSS (ex: '14px', '1.2em')
             */
            setFontSize: (size: string) => ReturnType;

            /**
             * Remove o tamanho de fonte customizado do texto selecionado.
             */
            unsetFontSize: () => ReturnType;
        };
    }
}

const FontSizeExtension = Extension.create({
    name: 'fontSize',

    addOptions() {
        return {
            types: ['textStyle'],
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: (element: HTMLElement) => {
                            return element.style.fontSize || null;
                        },
                        renderHTML: (attributes: Record<string, unknown>) => {
                            if (!attributes.fontSize) return {};
                            return {
                                style: `font-size: ${attributes.fontSize}`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setFontSize:
                (size: string) =>
                    ({ chain }) => {
                        return chain().setMark('textStyle', { fontSize: size }).run();
                    },
            unsetFontSize:
                () =>
                    ({ chain }) => {
                        return chain()
                            .setMark('textStyle', { fontSize: null })
                            .removeEmptyTextStyle()
                            .run();
                    },
        };
    },
});

export default FontSizeExtension;
