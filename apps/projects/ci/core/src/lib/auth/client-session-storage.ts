import { Subject } from 'rxjs';
import { SHA512 } from 'crypto-js';

export const USER_STORE_KEY = 'apps.ci.dev.br.store.User';
export const ACCOUNTS_STORAGE_KEY = 'CI_ACCOUNTS';
export const CIUSR_STORAGE_KEY = 'CIUSR';
export const ACCESS_SCOPE_STORAGE_KEY = 'CI_ACCESS_SCOPE';

export interface SessionTokenUpdateEvent {
    chaveAcesso?: string;
    bearer?: string;
    refreshToken?: string;
}

/**
 * Evento global disparado sempre que tokens de uma conta são atualizados ou limpos no storage.
 */
export const sessionStorageUpdated$ = new Subject<SessionTokenUpdateEvent | null>();

export function encodeBase64Utf8(serialized: string): string {
    try {
        return btoa(unescape(encodeURIComponent(serialized)));
    } catch {
        return btoa(serialized);
    }
}

export function decodeBase64Utf8(encoded: string): string {
    try {
        return decodeURIComponent(escape(atob(encoded)));
    } catch {
        return atob(encoded);
    }
}

export function decodeJwtPayload(token?: string | null): any | undefined {
    if (!token || typeof token !== 'string') return undefined;
    const clean = token.replace(/^Bearer\s+/i, '').trim();
    const parts = clean.split('.');
    if (parts.length !== 3) return undefined;
    try {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
        return JSON.parse(decodeBase64Utf8(padded));
    } catch {
        return undefined;
    }
}

export function getJwtExpirationMs(token?: string | null): number | undefined {
    const payload = decodeJwtPayload(token);
    if (typeof payload?.exp === 'number' && Number.isFinite(payload.exp)) {
        return payload.exp * 1000;
    }
    return undefined;
}

export function isJwtExpiringSoon(token?: string | null, leewaySeconds = 60): boolean {
    if (!token) return true;
    const expMs = getJwtExpirationMs(token);
    if (!expMs) return false;
    return Date.now() >= expMs - leewaySeconds * 1000;
}

export function isJwtExpired(token?: string | null, leewaySeconds = 5): boolean {
    return isJwtExpiringSoon(token, leewaySeconds);
}

export function extractChaveAcessoFromJwt(token?: string | null): string | undefined {
    const payload = decodeJwtPayload(token);
    const chave = payload?.chaveAcesso;
    return typeof chave === 'string' && chave.trim().length > 0 ? chave.trim() : undefined;
}

export function extractChaveAcessoFromSession(session: any): string | undefined {
    if (!session || typeof session !== 'object') return undefined;
    const direct =
        session?.authentication?.chaveAcesso ||
        session?.chaveAcesso;
    if (typeof direct === 'string' && direct.trim().length > 0) {
        return direct.trim();
    }
    const bearer = session?.authentication?.bearer || session?.bearer;
    const fromBearer = extractChaveAcessoFromJwt(bearer);
    if (fromBearer) return fromBearer;
    const refresh = session?.authentication?.refreshToken || session?.refreshToken;
    return extractChaveAcessoFromJwt(refresh);
}

export function readStoredJson<T = any>(rawKey: string, hashedKey = false): T | undefined {
    if (typeof localStorage === 'undefined') return undefined;
    try {
        const key = hashedKey ? SHA512(rawKey).toString() : rawKey;
        const raw = localStorage.getItem(key);
        if (!raw) return undefined;
        return JSON.parse(decodeBase64Utf8(raw)) as T;
    } catch {
        return undefined;
    }
}

export function writeStoredJson(rawKey: string, value: any, hashedKey = false): void {
    if (typeof localStorage === 'undefined') return;
    try {
        const key = hashedKey ? SHA512(rawKey).toString() : rawKey;
        const serialized = JSON.stringify(value, null, 2);
        localStorage.setItem(key, encodeBase64Utf8(serialized));
    } catch {
        // Ignora falhas de quota/modo privado
    }
}

export function readAccountsFromStorage(): any[] {
    const parsed = readStoredJson<any[]>(ACCOUNTS_STORAGE_KEY, false);
    return Array.isArray(parsed) ? parsed : [];
}

export function writeAccountsToStorage(accounts: any[]): void {
    writeStoredJson(ACCOUNTS_STORAGE_KEY, accounts, false);
}

export function readActiveUserStore(): any | undefined {
    return readStoredJson(USER_STORE_KEY, true);
}

export function writeActiveUserStore(value: any): void {
    writeStoredJson(USER_STORE_KEY, value, true);
}

export function clearAllAuthStorage(): void {
    if (typeof localStorage !== 'undefined') {
        try { localStorage.removeItem(SHA512(USER_STORE_KEY).toString()); } catch {}
        try { localStorage.removeItem(ACCOUNTS_STORAGE_KEY); } catch {}
        try { localStorage.removeItem(CIUSR_STORAGE_KEY); } catch {}
        try { localStorage.removeItem(ACCESS_SCOPE_STORAGE_KEY); } catch {}
    }
    sessionStorageUpdated$.next(null);
}

/**
 * Atualiza atomicamente os tokens em `CI_ACCOUNTS` e, se aplicável, em `apps.ci.dev.br.store.User`.
 */
export function updateAccountTokensInStorage(
    targetChaveAcesso: string | undefined,
    tokens: {
        bearer?: string;
        refreshToken?: string;
        chaveAcesso?: string;
    },
): void {
    const effectiveChave = tokens.chaveAcesso || targetChaveAcesso;
    const accounts = readAccountsFromStorage();
    let accountsModified = false;

    if (accounts.length > 0 && effectiveChave) {
        const updated = accounts.map(acc => {
            const accChave = extractChaveAcessoFromSession(acc);
            if (accChave && (accChave === targetChaveAcesso || accChave === effectiveChave)) {
                accountsModified = true;
                return {
                    ...acc,
                    authentication: {
                        ...(acc.authentication || {}),
                        ...(tokens.bearer ? { bearer: tokens.bearer } : {}),
                        ...(tokens.refreshToken ? { refreshToken: tokens.refreshToken } : {}),
                        ...(effectiveChave ? { chaveAcesso: effectiveChave } : {}),
                    },
                };
            }
            return acc;
        });
        if (accountsModified) {
            writeAccountsToStorage(updated);
        }
    }

    const currentStore = readActiveUserStore();
    if (currentStore?.authentication) {
        const currentChave = extractChaveAcessoFromSession(currentStore);
        if (!currentChave || !targetChaveAcesso || currentChave === targetChaveAcesso || currentChave === effectiveChave) {
            writeActiveUserStore({
                ...currentStore,
                authentication: {
                    ...currentStore.authentication,
                    ...(tokens.bearer ? { bearer: tokens.bearer } : {}),
                    ...(tokens.refreshToken ? { refreshToken: tokens.refreshToken } : {}),
                    ...(effectiveChave ? { chaveAcesso: effectiveChave } : {}),
                },
            });
        }
    }

    sessionStorageUpdated$.next({
        chaveAcesso: effectiveChave,
        bearer: tokens.bearer,
        refreshToken: tokens.refreshToken,
    });
}

/**
 * Obtém os tokens bearer das contas secundárias conectadas (excluindo o token da conta ativa).
 */
export function getSecondaryAccountTokens(activeBearer?: string): string[] {
    const accounts = readAccountsFromStorage();
    if (accounts.length === 0) return [];
    return accounts
        .map(a => a?.authentication?.bearer)
        .filter((t): t is string => typeof t === 'string' && t.length > 0 && t !== activeBearer && !isJwtExpired(t, 0));
}

export function setActiveAccessScope(scope?: string | string[] | null): void {
    if (typeof localStorage === 'undefined') return;
    try {
        if (!scope || (Array.isArray(scope) && scope.length === 0)) {
            localStorage.removeItem(ACCESS_SCOPE_STORAGE_KEY);
            return;
        }
        const value = Array.isArray(scope) ? scope.map(s => s.trim()).filter(Boolean).join(',') : String(scope).trim();
        if (!value) {
            localStorage.removeItem(ACCESS_SCOPE_STORAGE_KEY);
        } else {
            localStorage.setItem(ACCESS_SCOPE_STORAGE_KEY, value);
        }
    } catch {
        // Ignora erro de storage
    }
}

export function getActiveAccessScope(): string | undefined {
    if (typeof localStorage === 'undefined') return undefined;
    try {
        const val = localStorage.getItem(ACCESS_SCOPE_STORAGE_KEY);
        return val && val.trim().length > 0 ? val.trim() : undefined;
    } catch {
        return undefined;
    }
}
