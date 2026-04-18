import type { ETPInput, ETPApiResponse } from '../types';
import { getApiConfig } from './dodService';
import homologEtp from '../homolog-documents/homolog-etp';


/**
 * Envia os dados editados do DOD para a API do ETP e retorna as sugestões
 * URI: {baseUrl}/recommend_etp
 */
export async function submitETP(
    data: ETPInput,
    onLog?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void
): Promise<ETPApiResponse> {
    const config = getApiConfig();

    if (config.environment === 'homologacao') {
        onLog?.('Ambiente de Homologação detectado. Carregando dados locais...', 'info');
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simula latência
        onLog?.('Dados de homologação carregados com sucesso!', 'success');
        const mockTraceId = crypto.randomUUID ? crypto.randomUUID() : `homolog-etp-${Date.now()}`;
        return { trace_id: mockTraceId, texto_gerado: homologEtp } as ETPApiResponse;
    }

    // O endpoint ETP é separado do DOD
    // Removed unused baseUrl
    const url = `${config.baseUrl}/recommend_etp`;

    onLog?.('Preparando dados do DOD para geração do ETP...', 'info');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
        onLog?.(`Enviando requisição para ${url}...`, 'info');

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(config.apiKey ? { 'X-API-Key': config.apiKey } : {}),
                'X-Gemini-Model': config.model,
            },
            body: JSON.stringify(data),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            onLog?.(`Erro na resposta: ${response.status} - ${response.statusText}`, 'error');
            throw new Error(`Erro ${response.status}: ${errorText || response.statusText}`);
        }

        onLog?.('Resposta recebida com sucesso!', 'success');
        onLog?.('Processando sugestões do ETP...', 'info');

        const raw = await response.json();

        // Normaliza a resposta: o backend pode retornar no formato envelope
        // { trace_id, texto_gerado } ou diretamente os campos do ETP no nível raiz.
        let result: ETPApiResponse;
        if (raw.texto_gerado && raw.trace_id) {
            result = raw as ETPApiResponse;
        } else {
            const traceId = raw.trace_id || `etp-${Date.now()}`;
            // Se texto_gerado existe mas sem trace_id, ou se os campos estão no nível raiz
            const textoGerado = raw.texto_gerado || raw;
            result = { trace_id: traceId, texto_gerado: textoGerado };
            onLog?.('Resposta normalizada (formato direto detectado).', 'info');
        }

        onLog?.(`Documento ETP gerado com trace_id: ${result.trace_id}`, 'success');

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
