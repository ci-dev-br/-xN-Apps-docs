import * as crypto from 'crypto';

const SERVER_PEPPER = process.env.MESSAGER_PEPPER || 'CI_E2E_METADATA_PROTECTION_PEPPER_2026';
const AES_KEY = crypto.createHash('sha256').update(SERVER_PEPPER).digest(); // 32 bytes para AES-256

/**
 * Gera o hash determinístico único do canal entre dois participantes, independente da ordem
 */
export function computeChannelHash(userId1: string, userId2: string): string {
    const sorted = [String(userId1), String(userId2)].sort();
    return crypto.createHmac('sha256', SERVER_PEPPER)
        .update(`channel::${sorted[0]}::${sorted[1]}`)
        .digest('hex');
}

/**
 * Gera o hash cego do participante para indexação e consultas sem expor o userId
 */
export function computeParticipantHash(userId: string): string {
    return crypto.createHmac('sha256', SERVER_PEPPER)
        .update(`participant::${userId}`)
        .digest('hex');
}

/**
 * Gera o hash da mensagem encadeando com a mensagem anterior (Hash Chain)
 */
export function computeMessageHash(
    channelHash: string,
    previousMessageHash: string,
    timestamp: number,
    encryptedContent: string
): string {
    return crypto.createHash('sha256')
        .update(`${channelHash}::${previousMessageHash || 'GENESIS'}::${timestamp}::${encryptedContent || ''}`)
        .digest('hex');
}

/**
 * Criptografa metadados sensíveis do contato (nome, foto, id) para armazenamento protegido no banco
 */
export function encryptMetadata(data: any): string {
    if (!data) return '';
    try {
        const text = JSON.stringify(data);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', AES_KEY, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
    } catch {
        return '';
    }
}

/**
 * Descriptografa metadados sensíveis protegidos no banco
 */
export function decryptMetadata<T = any>(encryptedText?: string): T | null {
    if (!encryptedText || !encryptedText.includes(':')) return null;
    try {
        const [ivHex, cipherHex] = encryptedText.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', AES_KEY, iv);
        let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return JSON.parse(decrypted) as T;
    } catch {
        return null;
    }
}
