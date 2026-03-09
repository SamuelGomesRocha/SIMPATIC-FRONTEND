import type { DODResponse, FieldSelection } from '../types';


/**
 * Gera um UUID simples para IDs
 */
export function generateId(): string {
    return Math.random().toString(36).substring(2, 11);
}

/**
 * Formata a data atual para exibição
 */
export function formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

/**
 * Retorna o valor selecionado pelo usuário para um campo,
 * considerando edição customizada ou sugestão escolhida.
 */
export function getSelectedValue(
    fieldKey: string,
    suggestions: string[],
    selections: Record<string, FieldSelection>
): string {
    const selection = selections[fieldKey];
    if (!selection) return suggestions[0] || '';

    if (selection.customValue !== undefined && selection.customValue !== '') {
        return selection.customValue;
    }

    return suggestions[selection.selectedIndex] || suggestions[0] || '';
}

/**
 * Exporta o DOD preenchido no formato selecionado
 */
export async function exportDOD(
    format: 'pdf' | 'html' | 'docx' | 'odt',
    response: DODResponse,
    selections: Record<string, FieldSelection>
): Promise<void> {
    try {
        // 1. Carregar o template HTML
        const templateResponse = await fetch('/doc_models/template.html');
        if (!templateResponse.ok) {
            throw new Error('Falha ao carregar o modelo do documento.');
        }
        const templateText = await templateResponse.text();

        // 2. Criar um elemento temporário para manipular o HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(templateText, 'text/html');
        const container = doc.body;

        // 3. Mapeamentos
        const simpleFieldMap: Record<string, string> = {
            nome_projeto: '.resp_nome_do_projeto',
            data_envio: '.resp_data_envio',
            identificacao_pca: '.resp_identificacao_demanda',
            alinhamento_loa: '.resp_alinhamento_loa',
            fonte_recurso: '.resp_fonte_recurso',
            motivacao_justificativa: '.resp_motivacao_justificativa',
            resultados_beneficios: '.resp_resultados_beneficios',
        };

        const peFieldMap: Record<string, { selector: string; dataKey: string }> = {
            'planejamento_estrategico.plano_estrategico': { selector: '.resp_plano_estrategico', dataKey: 'plano_gestao' },
            'planejamento_estrategico.plano_gestao': { selector: '.resp_plano_gestao', dataKey: 'plano_gestao' },
            'planejamento_estrategico.plano_anual_contratacoes': { selector: '.resp_plano_anual', dataKey: 'plano_anual_contratacoes' },
            'planejamento_estrategico.pdtic': { selector: '.resp_pdtic', dataKey: 'pdtic' },
            'planejamento_estrategico.entic_jud': { selector: '.resp_entic_jud', dataKey: 'entic_jud' },
        };

        // 4. Preencher campos simples
        Object.entries(simpleFieldMap).forEach(([key, selector]) => {
            const element = container.querySelector(selector);
            if (element) {
                const suggestions = response[key as keyof DODResponse] as string[] || [];
                (element as HTMLElement).innerText = getSelectedValue(key, suggestions, selections);
            }
        });

        // 5. Preencher campos de Planejamento Estratégico
        Object.entries(peFieldMap).forEach(([key, { selector, dataKey }]) => {
            const element = container.querySelector(selector);
            if (element) {
                const suggestions = (response.planejamento_estrategico as any)[dataKey] as string[] || [];
                (element as HTMLElement).innerText = getSelectedValue(key, suggestions, selections);
            }
        });

        const filename = `DOD_${response.nome_projeto[0] || 'Oficializacao_Demanda'}`;

        if (format === 'pdf') {
            // Inject the template's <style> and enforce Times New Roman 12px
            // html2pdf only renders the element passed to .from(), so <head> styles are lost
            const styleEl = doc.head.querySelector('style');
            if (styleEl) {
                container.insertBefore(styleEl.cloneNode(true), container.firstChild);
            }
            container.style.fontFamily = '"Times New Roman", serif';
            container.style.fontSize = '12px';

            const opt = {
                margin: 10,
                filename: `${filename}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
            };
            const html2pdf = (await import('html2pdf.js')).default;
            html2pdf().set(opt).from(container).save();
        } else if (format === 'html') {
            const htmlContent = doc.documentElement.outerHTML;
            const blob = new Blob([htmlContent], { type: 'text/html' });
            saveAs(blob, `${filename}.html`);
        } else if (format === 'odt') {
            // Manual XML replacement for ODT (since docxtemplater doesn't support it)
            const PizZip = (await import('pizzip')).default;
            const templateResponse = await fetch('/doc_models/template.odt');
            const content = await templateResponse.arrayBuffer();
            const zip = new PizZip(content);

            const zipFile = zip.file('content.xml');
            if (!zipFile) throw new Error('Arquivo content.xml não encontrado no ODT.');
            let contentXml = zipFile.asText();

            // Prepare data
            const templateData: Record<string, string> = {};
            Object.entries(simpleFieldMap).forEach(([key]) => {
                const suggestions = response[key as keyof DODResponse] as string[] || [];
                templateData[key] = getSelectedValue(key, suggestions, selections);
            });
            Object.entries(peFieldMap).forEach(([key, { dataKey }]) => {
                const suggestions = (response.planejamento_estrategico as any)[dataKey] as string[] || [];
                const value = getSelectedValue(key, suggestions, selections);
                templateData[dataKey] = value;
                templateData[key.replace('planejamento_estrategico.', '')] = value;
            });

            // Replace {tags} in XML
            // Note: This is a simple replacement. If tags are split by XML tags in the template, it might fail.
            // But for a provided template where tags are typed cleanly, it works.
            Object.entries(templateData).forEach(([key, value]) => {
                const tag = `{${key}}`;
                contentXml = contentXml.split(tag).join(value);
            });

            zip.file('content.xml', contentXml);
            const out = zip.generate({ type: 'blob', mimeType: 'application/vnd.oasis.opendocument.text' });
            saveAs(out, `${filename}.odt`);

        } else if (format === 'docx') {
            // DOCX fallback to HTML-trick or docxtemplater if .docx template exists
            try {
                const PizZip = (await import('pizzip')).default;
                const Docxtemplater = (await import('docxtemplater')).default;

                // Try to see if there's a .docx template, otherwise fallback
                const docxResponse = await fetch('/doc_models/template.docx');
                if (!docxResponse.ok) throw new Error('No DOCX template');

                const content = await docxResponse.arrayBuffer();
                const zip = new PizZip(content);
                const document = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

                const templateData: Record<string, string> = {};
                Object.entries(simpleFieldMap).forEach(([key]) => {
                    const suggestions = response[key as keyof DODResponse] as string[] || [];
                    templateData[key] = getSelectedValue(key, suggestions, selections);
                });
                Object.entries(peFieldMap).forEach(([key, { dataKey }]) => {
                    const suggestions = (response.planejamento_estrategico as any)[dataKey] as string[] || [];
                    const value = getSelectedValue(key, suggestions, selections);
                    templateData[dataKey] = value;
                });

                document.render(templateData);
                const out = document.getZip().generate({
                    type: 'blob',
                    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                });
                saveAs(out, `${filename}.docx`);
            } catch (e) {
                console.warn('Falling back to HTML-to-DOCX trick', e);
                const mimeType = 'application/msword';
                const docxHeader = `
                    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                    <head><meta charset='utf-8'></head><body>${container.innerHTML}</body></html>`;
                const blob = new Blob([docxHeader], { type: mimeType });
                saveAs(blob, `${filename}.doc`);
            }
        }

    } catch (error) {
        console.error('Erro na exportação:', error);
        alert('Erro ao exportar o documento. Verifique o console para mais detalhes.');
    }
}

/**
 * Helper to download blob
 */
function saveAs(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
}
