/**
 * Serviço unificado de exportação de documentos (DOD, ETP, TR).
 *
 * Captura o HTML editado em tempo real do editor TipTap e exporta
 * nos formatos PDF, DOCX ou ODT, preservando todas as edições do usuário.
 */

// @ts-ignore – Vite raw import
import dodHtmlRaw from '../../doc_models/1. Documento de Oficializacao da Demanda (html).html?raw';
// @ts-ignore
import etpHtmlRaw from '../../doc_models/2. Estudo Tecnico Preliminar.html?raw';
// @ts-ignore
import trHtmlRaw from '../../doc_models/4. Termo de Referencia.html?raw';

/** Tipos de documento suportados */
export type DocumentType = 'DOD' | 'ETP' | 'TR';

/** Formatos de exportação suportados */
export type ExportFormat = 'pdf' | 'docx' | 'odt';

/** Mapa de nomes legíveis por tipo de documento */
const DOCUMENT_NAMES: Record<DocumentType, string> = {
    DOD: 'Documento de Oficializacao da Demanda',
    ETP: 'Estudo Tecnico Preliminar',
    TR: 'Termo de Referencia',
};

/** Mapa de templates HTML brutos por tipo de documento */
const RAW_TEMPLATES: Record<DocumentType, string> = {
    DOD: dodHtmlRaw,
    ETP: etpHtmlRaw,
    TR: trHtmlRaw,
};

/**
 * Extrai o bloco <style> do template HTML original.
 * Retorna uma string contendo apenas o CSS interno (sem as tags <style>).
 */
function extractTemplateStyles(rawHtml: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');
    const styles = doc.querySelectorAll('style');
    return Array.from(styles).map(s => s.innerHTML).join('\n');
}

/**
 * Captura o HTML editado pelo usuário no editor TipTap.
 * Busca o elemento `.rich-text-canvas .tiptap` no DOM ativo.
 */
function captureEditorHtml(): string | null {
    const editorElement = document.querySelector('.rich-text-canvas .tiptap');
    if (!editorElement) {
        console.warn('[exportService] Elemento TipTap não encontrado no DOM.');
        return null;
    }
    return editorElement.innerHTML;
}

/**
 * Exporta como PDF usando html2pdf.js.
 * Corrige o problema de PDF vazio injetando o conteúdo de forma limpa.
 */
async function exportAsPdf(styles: string, bodyHtml: string, filename: string): Promise<void> {
    const html2pdf = (await import('html2pdf.js')).default;

    // Criar container temporário para renderização
    const container = document.createElement('div');
    container.className = 'pdf-export-container';

    // Configurar o container para ser invisível mas processável pelo html2canvas
    Object.assign(container.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '210mm', // A4 Width
        padding: '20mm', // Margens padrão
        backgroundColor: 'white',
        opacity: '0',
        pointerEvents: 'none',
        zIndex: '-1000'
    });

    // Injetar estilos e conteúdo separadamente para evitar tags <html> duplicadas
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
        ${styles}
        body, .pdf-export-container {
            font-family: "Times New Roman", serif;
            font-size: 12pt;
            color: black;
        }
        .pdf-export-container table { border-collapse: collapse; width: 100%; }
        .pdf-export-container td, .pdf-export-container th { border: 1px solid #808080; padding: 4px; }
        .ProseMirror-focused { outline: none; }
        [data-field] { cursor: default; }
    `;

    container.appendChild(styleElement);

    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = bodyHtml;
    container.appendChild(contentDiv);

    document.body.appendChild(container);

    const opt = {
        margin: 0, // Margem já aplicada via CSS no container
        filename: `${filename}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            letterRendering: true
        },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    };

    try {
        // Aguardar pequeno delay para garantir que o DOM foi processado
        await new Promise(resolve => setTimeout(resolve, 100));
        await html2pdf().set(opt).from(container).save();
    } finally {
        document.body.removeChild(container);
    }
}

/**
 * Exporta como DOCX (via HTML-to-Word trick).
 * Mantido conforme solicitação do usuário.
 */
function exportAsDocx(fullHtml: string, filename: string): void {
    const docxHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office'
              xmlns:w='urn:schemas-microsoft-com:office:word'
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <style>
                body { font-family: "Times New Roman", serif; font-size: 12pt; }
                table { border-collapse: collapse; }
                td, th { border: 1px solid #808080; padding: 4px; }
            </style>
        </head>
        <body>${fullHtml}</body>
        </html>`;

    const blob = new Blob([docxHtml], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    saveAs(blob, `${filename}.doc`);
}

/**
 * Converte HTML básico para XML compatível com OpenDocument (ODT).
 */
function htmlToOdtXml(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    let xml = '';

    function processNode(node: Node): string {
        if (node.nodeType === Node.TEXT_NODE) {
            return escapeXml(node.textContent || '');
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element;
            const tagName = el.tagName.toLowerCase();
            let children = '';

            el.childNodes.forEach(child => {
                children += processNode(child);
            });

            switch (tagName) {
                case 'p':
                case 'div':
                    return `<text:p text:style-name="Standard">${children}</text:p>`;
                case 'b':
                case 'strong':
                    return `<text:span text:style-name="Strong">${children}</text:span>`;
                case 'i':
                case 'em':
                    return `<text:span text:style-name="Emphasis">${children}</text:span>`;
                case 'u':
                    return `<text:span text:style-name="Underline">${children}</text:span>`;
                case 'br':
                    return `<text:line-break/>`;
                case 'table':
                    return `<table:table table:name="Table1">${children}</table:table>`;
                case 'tr':
                    return `<table:table-row>${children}</table:table-row>`;
                case 'td':
                case 'th':
                    return `<table:table-cell office:value-type="string"><text:p>${children}</text:p></table:table-cell>`;
                case 'ul':
                    return `<text:list text:style-name="List1">${children}</text:list>`;
                case 'li':
                    return `<text:list-item><text:p>${children}</text:p></text:list-item>`;
                default:
                    // Se não reconhecer a tag, apenas processa os filhos
                    return children;
            }
        }
        return '';
    }

    doc.body.childNodes.forEach(node => {
        xml += processNode(node);
    });

    return xml;
}

/**
 * Exporta como ODT (via estrutura OpenDocument real).
 * Corrige o problema de "falhas" implementando uma estrutura XML válida.
 */
async function exportAsOdt(html: string, filename: string): Promise<void> {
    const PizZip = (await import('pizzip')).default;

    const odtBodyXml = htmlToOdtXml(html);

    // Template XML robusto com estilos básicos
    const contentXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content 
    xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" 
    xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" 
    xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" 
    xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" 
    xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" 
    office:version="1.2">
    <office:automatic-styles>
        <style:style style:name="Strong" style:family="text">
            <style:text-properties fo:font-weight="bold" style:font-weight-asian="bold" style:font-weight-complex="bold"/>
        </style:style>
        <style:style style:name="Emphasis" style:family="text">
            <style:text-properties fo:font-style="italic" style:font-style-asian="italic" style:font-style-complex="italic"/>
        </style:style>
        <style:style style:name="Underline" style:family="text">
            <style:text-properties style:text-underline-style="solid" style:text-underline-width="auto" style:text-underline-color="font-color"/>
        </style:style>
    </office:automatic-styles>
    <office:body>
        <office:text>
            ${odtBodyXml}
        </office:text>
    </office:body>
</office:document-content>`;

    const manifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
    <manifest:file-entry manifest:media-type="application/vnd.oasis.opendocument.text" manifest:full-path="/"/>
    <manifest:file-entry manifest:media-type="text/xml" manifest:full-path="content.xml"/>
</manifest:manifest>`;

    const mimetypeContent = 'application/vnd.oasis.opendocument.text';

    const zip = new PizZip();
    zip.file('mimetype', mimetypeContent, { compression: 'STORE' });
    zip.file('content.xml', contentXml);
    zip.folder('META-INF')!.file('manifest.xml', manifestXml);

    const out = zip.generate({
        type: 'blob',
        mimeType: 'application/vnd.oasis.opendocument.text',
        compression: 'DEFLATE',
    });
    saveAs(out, `${filename}.odt`);
}

/**
 * Escapa caracteres especiais para XML.
 */
function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Helper para download de blob.
 */
function saveAs(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
}

/**
 * Função principal de exportação.
 */
export async function exportDocument(
    format: ExportFormat,
    documentType: DocumentType,
): Promise<void> {
    try {
        // 1. Capturar HTML do editor
        const editorHtml = captureEditorHtml();
        if (!editorHtml) {
            alert('Não foi possível capturar o conteúdo do editor. Verifique se o modo "Edição Avançada" está ativo.');
            return;
        }

        // 2. Extrair estilos do template original
        const rawTemplate = RAW_TEMPLATES[documentType];
        const styles = extractTemplateStyles(rawTemplate);

        // 3. Nome do arquivo
        const filename = `${DOCUMENT_NAMES[documentType].replace(/ /g, '_')}`;

        // 4. Exportar no formato solicitado
        switch (format) {
            case 'pdf':
                await exportAsPdf(styles, editorHtml, filename);
                break;
            case 'docx':
                exportAsDocx(editorHtml, filename);
                break;
            case 'odt':
                await exportAsOdt(editorHtml, filename);
                break;
            default:
                throw new Error(`Formato não suportado: ${format}`);
        }
    } catch (error) {
        console.error('[exportService] Erro na exportação:', error);
        alert('Erro ao exportar o documento. Verifique o console para mais detalhes.');
    }
}

