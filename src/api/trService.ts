import type { ApiConfig, TRInput, TRResponse } from '../types';
import { API_URL_STORAGE_KEY, API_KEY_STORAGE_KEY, API_MODEL_STORAGE_KEY, API_ENVIRONMENT_STORAGE_KEY, DEFAULT_API_URL, DEFAULT_API_TIMEOUT, DEFAULT_API_MODEL, DEFAULT_API_ENVIRONMENT } from '../config/constants';
import homologTr from '../homolog-documents/homolog-tr';

/**
 * Retorna a configuração atual da API para TR
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
 * Envia os dados editados do ETP para a API do TR e retorna as sugestões
 * URI: {baseUrl}/recommend_tr
 */
export async function submitTR(
    data: TRInput,
    onLog?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void
): Promise<TRResponse> {
    const config = getApiConfig();

    if (config.environment === 'homologacao') {
        onLog?.('Ambiente de Homologação detectado. Carregando dados locais...', 'info');
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simula latência
        onLog?.('Dados de homologação carregados com sucesso!', 'success');
        return homologTr as TRResponse;
    }

    const url = "http://localhost:8400/recommend_tr";

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

        const result: TRResponse = await response.json();

        onLog?.('Sugestões do Termo de Referência processadas!', 'success');

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
