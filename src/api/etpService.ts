import type { ETPInput, ETPApiResponse } from '../types';
import { getApiConfig } from './dodService';
import homologEtp from '../homolog-documents/homolog-etp';
import { encryptApiKey, clearPublicKeyCache } from './cryptoService';


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

    const url = `${config.baseUrl}/recommend_etp`;

    onLog?.('Preparando dados do DOD para geração do ETP...', 'info');

    const executeRequest = async (isRetry = false): Promise<ETPApiResponse> => {
        let encryptedKey = '';
        if (config.apiKey) {
            try {
                encryptedKey = await encryptApiKey(config.apiKey, isRetry);
            } catch (e) {
                onLog?.('Aviso: Falha ao criptografar a chave (Servidor de segurança indisponível).', 'warning');
            }
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        try {
            if (!isRetry) onLog?.(`Enviando requisição para ${url}...`, 'info');

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(encryptedKey ? { 'X-API-Key': encryptedKey } : {}),
                    'X-Gemini-Model': config.model,
                },
                body: JSON.stringify(data),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                if ((response.status === 401 || response.status === 400) && !isRetry && config.apiKey) {
                    clearPublicKeyCache();
                    onLog?.('Chaves de segurança do servidor atualizadas. Sincronizando e tentando novamente...', 'info');
                    return executeRequest(true);
                }

                const errorText = await response.text();
                onLog?.(`Erro na resposta: ${response.status} - ${response.statusText}`, 'error');
                throw new Error(`Erro ${response.status}: ${errorText || response.statusText}`);
            }

            onLog?.('Resposta recebida com sucesso!', 'success');
            onLog?.('Processando sugestões do ETP...', 'info');

            const raw = await response.json();

            let result: ETPApiResponse;
            if (raw.texto_gerado && raw.trace_id) {
                result = raw as ETPApiResponse;
            } else {
                const traceId = raw.trace_id || `etp-${Date.now()}`;
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
    };

    return executeRequest();
}
