import type { ApiConfig, ETPInput, ETPResponse } from '../types';
import { API_URL_STORAGE_KEY, API_KEY_STORAGE_KEY, API_MODEL_STORAGE_KEY, API_ENVIRONMENT_STORAGE_KEY, DEFAULT_API_URL, DEFAULT_API_TIMEOUT, DEFAULT_API_MODEL, DEFAULT_API_ENVIRONMENT } from '../config/constants';
import homologEtp from '../homolog-documents/homolog-etp';

/**
 * Retorna a configuração atual da API para ETP
 */
function getApiConfig(): ApiConfig {
    const savedUrl = localStorage.getItem(API_URL_STORAGE_KEY);
    const savedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    const savedModel = localStorage.getItem(API_MODEL_STORAGE_KEY);
    const savedEnv = localStorage.getItem(API_ENVIRONMENT_STORAGE_KEY);

    return {
        baseUrl: savedUrl || DEFAULT_API_URL,
        timeout: DEFAULT_API_TIMEOUT,
        apiKey: savedApiKey || undefined,
        model: savedModel || DEFAULT_API_MODEL,
        environment: (savedEnv as 'producao' | 'homologacao') || DEFAULT_API_ENVIRONMENT,
    };
}

/**
 * Envia os dados editados do DOD para a API do ETP e retorna as sugestões
 * URI: {baseUrl}/recommend_etp
 */
export async function submitETP(
    data: ETPInput,
    onLog?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void
): Promise<ETPResponse> {
    const config = getApiConfig();

    if (config.environment === 'homologacao') {
        onLog?.('Ambiente de Homologação detectado. Carregando dados locais...', 'info');
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simula latência
        onLog?.('Dados de homologação carregados com sucesso!', 'success');
        return homologEtp as ETPResponse;
    }

    // O endpoint ETP é separado do DOD
    // Removed unused baseUrl
    const url = "http://localhost:8400/recommend_etp";

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

        const result: ETPResponse = await response.json();

        onLog?.('Sugestões do Estudo Técnico Preliminar processadas!', 'success');

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
