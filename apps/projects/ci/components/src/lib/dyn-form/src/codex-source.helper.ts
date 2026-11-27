import { Apps, IDynamicSchemaType } from '@ci/core';
import { CodexService, LocateSourceFileOutput } from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';

const SOURCE_FILE_EXT_RE = /\.(ts|tsx|js|jsx|mjs|cjs|html|scss|css|json|md|map|sql|yaml|yml)$/i;

export function looksLikeSourceFile(value: unknown): value is string {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    if (!trimmed) return false;
    return SOURCE_FILE_EXT_RE.test(trimmed) || trimmed.includes('/') || trimmed.includes('\\');
}

export function isBareFileName(value: unknown): value is string {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    if (!trimmed || trimmed.includes('/') || trimmed.includes('\\')) return false;
    return SOURCE_FILE_EXT_RE.test(trimmed);
}

export function inferCodeLanguage(filePath: string): string {
    const lower = (filePath || '').toLowerCase();
    if (lower.endsWith('.ts') || lower.endsWith('.tsx') || lower.endsWith('.map')) return 'typescript';
    if (lower.endsWith('.js') || lower.endsWith('.jsx') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) return 'javascript';
    if (lower.endsWith('.html')) return 'html';
    if (lower.endsWith('.scss')) return 'scss';
    if (lower.endsWith('.css')) return 'css';
    if (lower.endsWith('.json')) return 'json';
    if (lower.endsWith('.md')) return 'markdown';
    if (lower.endsWith('.sql')) return 'sql';
    if (lower.endsWith('.yml') || lower.endsWith('.yaml')) return 'yaml';
    return 'typescript';
}

export async function resolveCodeXDynamicType(
    appsService?: Apps,
    filePath?: string,
): Promise<IDynamicSchemaType | undefined> {
    if (!appsService) return undefined;

    const attempts: Array<{ type?: string; format?: string; value?: string }> = [];
    if (filePath) {
        attempts.push({ value: filePath });
    }
    attempts.push(
        { type: 'ts', format: 'ts' },
        { type: 'typescript', format: 'typescript' },
        { type: 'codex', format: 'code' },
        { type: 'map', format: 'map' },
    );

    for (const criteria of attempts) {
        const resolved = await appsService.resolveDynamicType(criteria);
        if (resolved?.component) {
            return resolved;
        }
    }
    return undefined;
}

export async function locateWorkspaceFileByName(
    codexService: CodexService | undefined,
    name: string,
    limit = 15,
    extensions?: string[],
): Promise<LocateSourceFileOutput | null> {
    if (!codexService || typeof codexService.locateFiles !== 'function') {
        return null;
    }
    const cleanName = (name || '').trim();
    if (!cleanName) return null;

    return await lastValueFrom(
        codexService.locateFiles({
            name: cleanName,
            extensions,
            limit,
        }),
    );
}
