import type { TRInput, TRApiResponse } from '../types';
import { getApiConfig } from './dodService';
import homologTr from '../homolog-documents/homolog-tr';


/**
 * Envia os dados editados do ETP para a API do TR e retorna as sugestões
 * URI: {baseUrl}/recommend_tr
 */
export async function submitTR(
    data: TRInput,
    onLog?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void
): Promise<TRApiResponse> {
    const config = getApiConfig();

    if (config.environment === 'homologacao') {
        onLog?.('Ambiente de Homologação detectado. Carregando dados locais...', 'info');
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simula latência
        onLog?.('Dados de homologação carregados com sucesso!', 'success');
        const mockTraceId = crypto.randomUUID ? crypto.randomUUID() : `homolog-tr-${Date.now()}`;
        return { trace_id: mockTraceId, texto_gerado: homologTr } as TRApiResponse;
    }

    const url = `${config.baseUrl}/recommend_tr`;

    onLog?.('Preparando dados do ETP para geração do TR...', 'info');

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
        onLog?.('Processando sugestões do TR...', 'info');

        const raw = await response.json();

        // Normaliza a resposta: o backend pode retornar no formato envelope
        // { trace_id, texto_gerado } ou diretamente os campos do TR no nível raiz.
        let result: TRApiResponse;
        if (raw.texto_gerado && raw.trace_id) {
            result = raw as TRApiResponse;
        } else {
            const traceId = raw.trace_id || `tr-${Date.now()}`;
            const textoGerado = raw.texto_gerado || raw;
            result = { trace_id: traceId, texto_gerado: textoGerado };
            onLog?.('Resposta normalizada (formato direto detectado).', 'info');
        }

        onLog?.(`Documento TR gerado com trace_id: ${result.trace_id}`, 'success');

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
