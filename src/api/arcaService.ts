import type { ArcaSessionData } from '../types';
import { DEFAULT_API_URL } from '../config/constants';

/**
 * Busca os dados da sessão ARCA a partir do token.
 * 
 * O token é single-use: após ser consumido, o backend o invalida.
 * Também expira após 5 minutos se não for utilizado.
 * 
 * @param token UUID do token de sessão recebido via query parameter
 * @returns Dados completos da contratação enviados pelo ARCA
 * @throws Error se o token não existir, já foi usado ou expirou
 */
export async function fetchArcaSession(token: string): Promise<ArcaSessionData> {
    const url = `${DEFAULT_API_URL}/arca/session/${token}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Sessão ARCA não encontrada, já utilizada ou expirada.');
        }
        const errorText = await response.text();
        throw new Error(`Erro ao buscar sessão ARCA: ${response.status} - ${errorText}`);
    }

    return response.json();
}
