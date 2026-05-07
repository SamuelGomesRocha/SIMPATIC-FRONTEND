import { DEFAULT_API_URL } from '../config/constants';

let cachedPublicKey: CryptoKey | null = null;

/**
 * Converte string base64 para ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Converte string PEM (com cabecalhos) para um CryptoKey instanciado
 */
async function importPublicKey(pem: string): Promise<CryptoKey> {
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    
    if (!pem.includes(pemHeader) || !pem.includes(pemFooter)) {
        throw new Error("Formato PEM inválido retornado pelo servidor.");
    }

    const pemContents = pem.substring(
        pem.indexOf(pemHeader) + pemHeader.length,
        pem.indexOf(pemFooter)
    ).replace(/\s/g, ''); // remove quebras de linha

    const binaryDer = base64ToArrayBuffer(pemContents);

    return await window.crypto.subtle.importKey(
        "spki",
        binaryDer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["encrypt"]
    );
}

/**
 * Busca a chave pública do servidor e armazena em cache na memória.
 */
export async function fetchPublicKey(forceRefresh = false): Promise<CryptoKey> {
    if (cachedPublicKey && !forceRefresh) {
        return cachedPublicKey;
    }

    try {
        const response = await fetch(`${DEFAULT_API_URL}/crypto/public-key`);
        if (!response.ok) {
            throw new Error(`Falha HTTP ${response.status} ao buscar chave pública`);
        }
        
        // A API pode retornar a string diretamente ou um JSON com { "public_key": "..." }
        // Assumimos que o backend retorna um JSON com o campo public_key
        const data = await response.json();
        const pemString = data.public_key || data;
        
        cachedPublicKey = await importPublicKey(pemString);
        return cachedPublicKey;
    } catch (error) {
        console.error('Erro ao baixar/importar Chave Pública RSA:', error);
        throw error;
    }
}

/**
 * Usa a Web Crypto API para criptografar a string original com RSA-OAEP.
 * Retorna o resultado em Base64.
 */
export async function encryptApiKey(plainKey: string, forceRefresh = false): Promise<string> {
    const publicKey = await fetchPublicKey(forceRefresh);
    const encodedKey = new TextEncoder().encode(plainKey);
    
    const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP"
        },
        publicKey,
        encodedKey
    );

    // Converte de ArrayBuffer para Base64
    const encryptedArray = new Uint8Array(encryptedBuffer);
    
    // Chunking array to string para evitar "Maximum call stack size exceeded" em chaves enormes (embora 256 bytes seja ok)
    let binaryStr = '';
    for (let i = 0; i < encryptedArray.length; i++) {
        binaryStr += String.fromCharCode(encryptedArray[i]);
    }
    
    return window.btoa(binaryStr);
}

/**
 * Limpa o cache da chave pública (usado em lógicas de retry)
 */
export function clearPublicKeyCache() {
    cachedPublicKey = null;
}
