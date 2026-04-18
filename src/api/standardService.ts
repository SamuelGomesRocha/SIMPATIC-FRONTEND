import type { StandardExtractResponse } from '../types';
import { getApiConfig } from './dodService';

/**
 * Função recursiva para transformar listas de strings em uma única string,
 * mantendo o encapsulamento em array para compatibilidade com o front-end (Tipagem string[]).
 * Ex: ["Parágrafo 1", "Parágrafo 2"] -> ["Parágrafo 1\nParágrafo 2"]
 */
function joinStringArrays(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj)) {
        if (obj.length > 0 && obj.every(item => typeof item === 'string')) {
            return [obj.join('\n')];
        }
        return obj.map(joinStringArrays);
    }

    if (typeof obj === 'object') {
        const newObj: any = {};
        for (const key in obj) {
            newObj[key] = joinStringArrays(obj[key]);
        }
        return newObj;
    }

    return obj;
}

/**
 * Envia 3 PDFs preexistentes (DOD, ETP, TR) ao endpoint /standard/extract
 * e retorna a resposta consolidada com os 3 documentos extraídos.
 */
export async function submitStandardExtraction(
    files: { dod: File; etp: File; tr: File },
    onLog?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void
): Promise<StandardExtractResponse> {
    const config = getApiConfig();
    const url = `${config.baseUrl}/standard/extract`;

    onLog?.('Preparando upload dos documentos PDF...', 'info');

    const formData = new FormData();
    formData.append('file_dod', files.dod, files.dod.name);
    formData.append('file_etp', files.etp, files.etp.name);
    formData.append('file_tr', files.tr, files.tr.name);

    onLog?.(`DOD: ${files.dod.name} (${(files.dod.size / 1024).toFixed(0)} KB)`, 'info');
    onLog?.(`ETP: ${files.etp.name} (${(files.etp.size / 1024).toFixed(0)} KB)`, 'info');
    onLog?.(`TR: ${files.tr.name} (${(files.tr.size / 1024).toFixed(0)} KB)`, 'info');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
        onLog?.(`Enviando documentos para ${config.baseUrl}...`, 'info');
        onLog?.('Extraindo conteúdo do DOD...', 'info');

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                // Não definir Content-Type — o browser define automaticamente com boundary do FormData
                ...(config.apiKey ? { 'X-API-Key': config.apiKey } : {}),
                'X-Gemini-Model': config.model,
            },
            body: formData,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            onLog?.(`Erro na resposta: ${response.status} - ${response.statusText}`, 'error');
            throw new Error(`Erro ${response.status}: ${errorText || response.statusText}`);
        }

        onLog?.('Extraindo conteúdo do ETP...', 'info');
        onLog?.('Extraindo conteúdo do TR...', 'info');

        const rawResult = await response.json();
        const result: StandardExtractResponse = joinStringArrays(rawResult);

        onLog?.('Todos os documentos foram extraídos com sucesso!', 'success');

        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            onLog?.('Timeout: a requisição excedeu o tempo limite.', 'error');
            throw new Error('A requisição excedeu o tempo limite. Verifique a conexão com o servidor.');
        }
        throw error;
    }
}
