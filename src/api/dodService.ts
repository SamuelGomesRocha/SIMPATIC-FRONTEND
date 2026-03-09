import type { ApiConfig, DemandaInput, DODResponse } from '../types';
import { API_URL_STORAGE_KEY, API_KEY_STORAGE_KEY, API_MODEL_STORAGE_KEY, API_ENVIRONMENT_STORAGE_KEY, DEFAULT_API_URL, DEFAULT_API_TIMEOUT, DEFAULT_API_MODEL, DEFAULT_API_ENVIRONMENT } from '../config/constants';
import homologDod from '../homolog-documents/homolog-dod';

/**
 * Retorna a configuração atual da API
 */
export function getApiConfig(): ApiConfig {
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
 * Salva o ambiente da API no localStorage
 */
export function setApiEnvironment(env: 'producao' | 'homologacao'): void {
    localStorage.setItem(API_ENVIRONMENT_STORAGE_KEY, env);
}

/**
 * Retorna o ambiente da API salvo
 */
export function getApiEnvironment(): 'producao' | 'homologacao' {
    return (localStorage.getItem(API_ENVIRONMENT_STORAGE_KEY) as 'producao' | 'homologacao') || DEFAULT_API_ENVIRONMENT;
}

/**
 * Salva a URL da API no localStorage
 */
export function setApiUrl(url: string): void {
    localStorage.setItem(API_URL_STORAGE_KEY, url);
}

/**
 * Retorna a URL da API salva
 */
export function getApiUrl(): string {
    return localStorage.getItem(API_URL_STORAGE_KEY) || DEFAULT_API_URL;
}

/**
 * Salva a chave de API do Gemini no localStorage
 */
export function setApiKey(key: string): void {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

/**
 * Retorna a chave de API do Gemini salva
 */
export function getApiKey(): string {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
}

/**
 * Salva o modelo do Gemini no localStorage
 */
export function setApiModel(model: string): void {
    localStorage.setItem(API_MODEL_STORAGE_KEY, model);
}

/**
 * Retorna o modelo do Gemini salvo
 */
export function getApiModel(): string {
    return localStorage.getItem(API_MODEL_STORAGE_KEY) || DEFAULT_API_MODEL;
}

/**
 * Envia os dados do formulário para a API e retorna as sugestões do DOD
 */
export async function submitDemanda(
    data: DemandaInput,
    onLog?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void
): Promise<DODResponse> {
    const config = getApiConfig();

    if (config.environment === 'homologacao') {
        onLog?.('Ambiente de Homologação detectado. Carregando dados locais...', 'info');
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simula latência
        onLog?.('Dados de homologação carregados com sucesso!', 'success');
        return homologDod as DODResponse;
    }

    const url = `${config.baseUrl}`;

    onLog?.('Preparando dados da requisição...', 'info');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
        onLog?.(`Enviando requisição para ${config.baseUrl}...`, 'info');

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
        onLog?.('Processando sugestões...', 'info');

        const result: DODResponse = await response.json();

        onLog?.('Sugestões processadas com sucesso!', 'success');

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
