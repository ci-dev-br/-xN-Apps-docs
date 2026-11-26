import * as babelParser from '@babel/parser';

export const MERMAID_RESERVED_KEYWORDS = new Set([
    'class',
    'namespace',
    'note',
    'direction',
    'link',
    'callback',
    'style',
    'click',
    'end',
    'call',
    'href',
    'default',
    'title',
    'acctitle',
    'accdescr',
    'cssclass',
    'classdef',
    'interaction',
    'for',
]);

export const BUILTIN_TYPE_NAMES = new Set([
    'String',
    'Number',
    'Boolean',
    'Any',
    'Void',
    'Null',
    'Undefined',
    'Unknown',
    'Never',
    'Object',
    'BigInt',
    'Symbol',
    'This',
    'Array',
    'ReadonlyArray',
    'Promise',
    'Observable',
    'BehaviorSubject',
    'ReplaySubject',
    'Subject',
    'Subscription',
    'EventEmitter',
    'Signal',
    'WritableSignal',
    'Record',
    'Partial',
    'Required',
    'Readonly',
    'Pick',
    'Omit',
    'Exclude',
    'Extract',
    'NonNullable',
    'ReturnType',
    'Parameters',
    'Map',
    'Set',
    'WeakMap',
    'WeakSet',
    'Date',
    'Error',
    'RegExp',
    'Function',
    'Tuple',
    'HTMLElement',
    'Element',
    'Node',
    'Event',
    'MouseEvent',
    'KeyboardEvent',
]);

/**
 * Converte qualquer identificador TypeScript/nome de pacote em um identificador
 * seguro para o parser de `classDiagram` do Mermaid.
 */
export function toMermaidId(rawName?: string | null, fallback = 'Entity'): string {
    let clean = String(rawName || '')
        .trim()
        .replace(/[^a-zA-Z0-9_]/g, '_');

    if (!clean) {
        clean = fallback;
    }
    if (/^[0-9]/.test(clean)) {
        clean = `C_${clean}`;
    }
    if (MERMAID_RESERVED_KEYWORDS.has(clean.toLowerCase())) {
        clean = `${clean}_`;
    }
    return clean;
}

export function toMermaidNamespace(rawPkg?: string | null): string {
    const clean = toMermaidId(rawPkg || 'Main', 'pkg_Main');
    if (clean === 'Main') return 'Main';
    return clean.startsWith('pkg_') ? clean : clean;
}

/**
 * Sanitiza texto livre para blocos `note` do Mermaid sem quebrar lexers com aspas,
 * chaves, crases ou quebras de linha cruas.
 */
export function sanitizeMermaidNote(text: string, maxLen: number = 140): string {
    if (!text) return '';
    let clean = String(text)
        .replace(/[\r\n]+/g, '<br>')
        .replace(/"/g, "'")
        .replace(/`/g, '')
        .replace(/[{}]/g, (ch) => (ch === '{' ? '(' : ')'))
        .replace(/;/g, ',')
        .replace(/\\/g, '/')
        .replace(/(<br>\s*)+/g, '<br>')
        .trim();

    if (clean.length > maxLen) {
        clean = clean.slice(0, Math.max(0, maxLen - 3)) + '...';
    }
    return clean;
}

/**
 * Sanitiza rótulos curtos (ex.: nomes de propriedades em setas de relacionamento).
 */
export function sanitizeMermaidRelationLabel(label?: string | null): string {
    if (!label) return '';
    return String(label)
        .replace(/[:;"'`{}()<>|\r\n\\]/g, '')
        .trim();
}

export function extractQualifiedName(typeNameNode: any): string {
    if (!typeNameNode) return '';
    if (typeNameNode.type === 'Identifier') {
        return typeNameNode.name || '';
    }
    if (typeNameNode.type === 'TSQualifiedName') {
        const left = extractQualifiedName(typeNameNode.left);
        const right = extractQualifiedName(typeNameNode.right);
        return [left, right].filter(Boolean).join('_');
    }
    if (typeNameNode.type === 'MemberExpression') {
        const obj = extractQualifiedName(typeNameNode.object);
        const prop = extractQualifiedName(typeNameNode.property);
        return [obj, prop].filter(Boolean).join('_');
    }
    if (typeNameNode.type === 'ThisExpression') {
        return 'this';
    }
    return typeNameNode.name || '';
}

/**
 * Serializa um nó de tipo TypeScript (AST do Babel) em sintaxe compatível com Mermaid `classDiagram`:
 * - Evita `~...~` aninhados (que causam erro de sintaxe no Mermaid)
 * - Evita tipos vazios (`Promise~~`, `[]`, `String|`)
 * - Evita vírgulas e parênteses dentro de tipos de parâmetros de método
 */
export function formatTsTypeToMermaid(
    typeNode: any,
    depth = 0,
    forParam = false,
): string {
    if (!typeNode) return '';
    const t = typeNode.typeAnnotation && typeNode.type === 'TSTypeAnnotation'
        ? typeNode.typeAnnotation
        : typeNode;
    if (!t || typeof t !== 'object') return '';

    let raw = '';
    switch (t.type) {
        case 'TSStringKeyword': raw = 'String'; break;
        case 'TSNumberKeyword': raw = 'Number'; break;
        case 'TSBooleanKeyword': raw = 'Boolean'; break;
        case 'TSAnyKeyword': raw = 'Any'; break;
        case 'TSVoidKeyword': raw = 'Void'; break;
        case 'TSNullKeyword': raw = 'Null'; break;
        case 'TSUndefinedKeyword': raw = 'Undefined'; break;
        case 'TSUnknownKeyword': raw = 'Unknown'; break;
        case 'TSNeverKeyword': raw = 'Never'; break;
        case 'TSObjectKeyword': raw = 'Object'; break;
        case 'TSBigIntKeyword': raw = 'BigInt'; break;
        case 'TSSymbolKeyword': raw = 'Symbol'; break;
        case 'TSThisType': raw = 'This'; break;
        case 'TSParenthesizedType':
            raw = formatTsTypeToMermaid(t.typeAnnotation, depth, forParam);
            break;
        case 'TSTypeLiteral':
            raw = 'Object';
            break;
        case 'TSFunctionType':
        case 'TSConstructorType':
            raw = 'Function';
            break;
        case 'TSTupleType':
            raw = 'Tuple';
            break;
        case 'TSLiteralType': {
            const litType = t.literal?.type;
            if (litType === 'BooleanLiteral') raw = 'Boolean';
            else if (litType === 'NumericLiteral' || litType === 'BigIntLiteral') raw = 'Number';
            else raw = 'String';
            break;
        }
        case 'TSTypeOperator':
            raw = formatTsTypeToMermaid(t.typeAnnotation, depth, forParam) || 'Any';
            break;
        case 'TSTypeQuery': {
            const qName = extractQualifiedName(t.exprName);
            raw = qName ? `typeof_${toMermaidId(qName, 'Ref')}` : 'Any';
            break;
        }
        case 'TSIndexedAccessType':
            raw = formatTsTypeToMermaid(t.objectType, depth, forParam) || 'Any';
            break;
        case 'TSMappedType':
        case 'TSConditionalType':
            raw = 'Any';
            break;
        case 'TSArrayType': {
            const el = formatTsTypeToMermaid(t.elementType, depth + 1, forParam) || 'Any';
            const cleanEl = el.replace(/[|]/g, '_');
            raw = `${cleanEl}[]`;
            break;
        }
        case 'TSTypeReference': {
            const baseName = toMermaidId(extractQualifiedName(t.typeName), 'Unknown');
            const paramList = (t.typeParameters || t.typeArguments)?.params || [];
            if (paramList.length > 0) {
                const formattedParams = paramList
                    .map((p: any) => formatTsTypeToMermaid(p, depth + 1, forParam))
                    .filter(Boolean);
                if (formattedParams.length > 0) {
                    if (depth === 0 && !forParam) {
                        const inner = formattedParams.join(', ').replace(/~/g, '');
                        raw = `${baseName}~${inner}~`;
                    } else if (forParam) {
                        const inner = formattedParams.join(' ').replace(/[~,]/g, '');
                        raw = depth === 0 ? `${baseName}~${inner}~` : `${baseName}_of_${inner}`;
                    } else {
                        const inner = formattedParams.join('_').replace(/[~,\s]+/g, '_');
                        raw = `${baseName}_of_${inner}`;
                    }
                } else {
                    raw = baseName;
                }
            } else {
                raw = baseName;
            }
            break;
        }
        case 'TSUnionType':
        case 'TSIntersectionType': {
            const sep = t.type === 'TSUnionType' ? (forParam ? '_or_' : '|') : '_and_';
            const parts: string[] = Array.from(
                new Set<string>(
                    (t.types || [])
                        .map((sub: any) => formatTsTypeToMermaid(sub, depth + 1, forParam))
                        .map((s: string) => s.replace(/~/g, ''))
                        .filter(Boolean)
                )
            );
            raw = parts.join(sep);
            break;
        }
        default:
            raw = '';
    }

    return sanitizeMermaidTypeString(raw, forParam);
}

export function sanitizeMermaidTypeString(raw: string, forParam = false): string {
    if (!raw) return '';
    let sanitized = String(raw)
        .replace(/[\r\n;"'`{}()<>#]/g, '')
        .trim();

    // Garante no máximo um par balanceado de `~...~` na string de tipo
    const firstTilde = sanitized.indexOf('~');
    if (firstTilde !== -1) {
        const before = sanitized.slice(0, firstTilde);
        const rest = sanitized.slice(firstTilde + 1).replace(/~/g, '');
        sanitized = rest ? `${before}~${rest}~` : before;
    }

    // Remove barras verticais sobrando no início ou fim
    sanitized = sanitized.replace(/^\|+|\|+$/g, '').replace(/\|{2,}/g, '|');

    if (forParam) {
        sanitized = sanitized.replace(/,/g, '');
    }

    return sanitized.trim();
}

/**
 * Extrai nomes de entidades (classes/interfaces/tipos customizados) referenciados dentro
 * de qualquer expressão de tipo TypeScript, ignorando tipos utilitários e primitivos.
 */
export function extractReferencedTypeNames(typeNode: any): string[] {
    const refs = new Set<string>();
    const visit = (node: any) => {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) {
            node.forEach(visit);
            return;
        }
        const t = node.type === 'TSTypeAnnotation' ? node.typeAnnotation : node;
        if (!t || typeof t !== 'object') return;

        if (t.type === 'TSTypeReference') {
            const rawName = extractQualifiedName(t.typeName);
            const cleanId = toMermaidId(rawName, '');
            if (cleanId && /^[A-Z]/.test(cleanId) && !BUILTIN_TYPE_NAMES.has(cleanId)) {
                refs.add(cleanId);
            }
            const params = (t.typeParameters || t.typeArguments)?.params || [];
            params.forEach(visit);
            return;
        }

        for (const key of Object.keys(t)) {
            if (!['loc', 'start', 'end', 'leadingComments', 'trailingComments'].includes(key)) {
                visit(t[key]);
            }
        }
    };

    visit(typeNode);
    return Array.from(refs);
}

/**
 * Extrai o nome de chave de membro (propriedade ou método) com tolerância a chaves
 * computadas, literais ou incompletas geradas durante erro de sintaxe.
 */
export function extractMemberName(member: any): { rawName: string; safeName: string; isPrivateName: boolean } | null {
    if (!member || !member.key) return null;
    const key = member.key;
    let rawName = '';
    let isPrivateName = false;

    if (key.type === 'Identifier') {
        rawName = key.name || '';
    } else if (key.type === 'PrivateName') {
        rawName = key.id?.name || '';
        isPrivateName = true;
    } else if (key.type === 'StringLiteral' || key.type === 'NumericLiteral') {
        rawName = String(key.value ?? '');
    } else if (member.computed) {
        const inner = extractQualifiedName(key);
        rawName = inner || 'computed';
    }

    if (!rawName) return null;
    let safeName = rawName.replace(/[^a-zA-Z0-9_$]/g, '_');
    if (!safeName) safeName = 'member';
    if (member.kind === 'get' && !safeName.startsWith('get_')) {
        safeName = `get_${safeName}`;
    } else if (member.kind === 'set' && !safeName.startsWith('set_')) {
        safeName = `set_${safeName}`;
    }

    return { rawName, safeName, isPrivateName };
}

export interface ExtractedMethodParam {
    displayName: string;
    safeName: string;
    typeStr: string;
    referencedTypes: string[];
    isParameterProperty: boolean;
}

/**
 * Extrai nome e tipo seguro de um parâmetro de método ou construtor,
 * cobrindo `TSParameterProperty`, `AssignmentPattern`, `RestElement`,
 * `ObjectPattern` e `ArrayPattern`.
 */
export function extractMethodParam(param: any, index: number): ExtractedMethodParam {
    if (!param || typeof param !== 'object') {
        return {
            displayName: `arg${index}`,
            safeName: `arg${index}`,
            typeStr: '',
            referencedTypes: [],
            isParameterProperty: false,
        };
    }

    let isParameterProperty = false;
    let target = param;
    if (target.type === 'TSParameterProperty' && target.parameter) {
        isParameterProperty = true;
        target = target.parameter;
    }

    let typeAnnotation = target.typeAnnotation;
    if (target.type === 'AssignmentPattern') {
        if (!typeAnnotation && target.left?.typeAnnotation) {
            typeAnnotation = target.left.typeAnnotation;
        }
        target = target.left || target;
    } else if (target.type === 'RestElement') {
        if (!typeAnnotation && target.typeAnnotation) {
            typeAnnotation = target.typeAnnotation;
        }
        target = target.argument || target;
    }

    let rawName = `arg${index}`;
    if (target?.type === 'Identifier' && target.name) {
        rawName = target.name;
    } else if (target?.type === 'ObjectPattern') {
        rawName = `options${index > 0 ? index : ''}`;
    } else if (target?.type === 'ArrayPattern') {
        rawName = `items${index > 0 ? index : ''}`;
    }

    const safeName = rawName.replace(/[^a-zA-Z0-9_$]/g, '_') || `arg${index}`;
    const typeStr = formatTsTypeToMermaid(typeAnnotation, 0, true);
    const referencedTypes = extractReferencedTypeNames(typeAnnotation);

    return {
        displayName: rawName,
        safeName,
        typeStr,
        referencedTypes,
        isParameterProperty,
    };
}

/**
 * Formata uma mensagem de erro de transcrição TS -> Mermaid legível para o usuário.
 */
export function formatUmlTranscriptionError(err: any, astErrors: any[] = []): string {
    const rawMsg = String(err?.str || err?.message || '').trim();
    if (rawMsg.includes('Nenhuma classe ou interface')) {
        return rawMsg;
    }

    if (astErrors.length > 0) {
        const first = astErrors[0];
        const line = first?.loc?.line ?? first?.loc?.start?.line;
        const tsMsg = String(first?.message || 'Erro de sintaxe TypeScript').replace(/\s*\(\d+:\d+\)\s*$/, '');
        return line
            ? `Erro de sintaxe TypeScript na linha ${line}: ${tsMsg}`
            : `Erro de sintaxe TypeScript: ${tsMsg}`;
    }

    if (rawMsg.toLowerCase().includes('parse error') || rawMsg.toLowerCase().includes('syntax error')) {
        const firstLine = rawMsg.split(/\r?\n/)[0]?.trim() || 'Erro de sintaxe Mermaid';
        return `Erro ao transcrever TypeScript para Mermaid: ${firstLine}`;
    }

    return rawMsg || 'Falha ao converter código TypeScript em UML.';
}

export function parseTypeScriptSafely(code: string): { ast: any; errors: any[] } {
    try {
        const ast = babelParser.parse(code, {
            sourceType: 'module',
            plugins: [
                'typescript',
                'decorators-legacy',
                'jsx',
                'moduleBlocks',
            ],
            errorRecovery: true,
        });
        const errors = Array.isArray((ast as any).errors) ? (ast as any).errors : [];
        return { ast, errors };
    } catch (err: any) {
        // Fallback sem JSX caso `<T>` genérico ambíguo falhe em `.ts`
        try {
            const ast = babelParser.parse(code, {
                sourceType: 'module',
                plugins: ['typescript', 'decorators-legacy', 'moduleBlocks'],
                errorRecovery: true,
            });
            const errors = Array.isArray((ast as any).errors) ? (ast as any).errors : [];
            return { ast, errors };
        } catch {
            throw err;
        }
    }
}
