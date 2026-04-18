import type { DocumentEvaluationPayload } from '../types';
import { getApiConfig } from './dodService';

/**
 * Erro customizado para avaliação duplicada (HTTP 400)
 */
export class DuplicateEvaluationError extends Error {
    constructor(message: string = 'Esta seção já foi avaliada para este documento.') {
        super(message);
        this.name = 'DuplicateEvaluationError';
    }
}

/**
 * Envia a avaliação humana (Ground Truth) para o back-end.
 *
 * @throws {DuplicateEvaluationError} Se a seção já foi avaliada (HTTP 400)
 * @throws {Error} Para outros erros de rede ou servidor
 */
export async function submitEvaluation(payload: DocumentEvaluationPayload): Promise<void> {
    const config = getApiConfig();
    const EVALUATION_API_URL = `${config.baseUrl}/evaluation/evaluate`;

    const response = await fetch(EVALUATION_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (response.status === 400) {
        throw new DuplicateEvaluationError();
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText || response.statusText}`);
    }
}
