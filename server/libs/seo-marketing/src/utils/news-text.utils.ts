import { News } from '../models/news.entity';

export const PT_STOP_WORDS = new Set([
    'para', 'como', 'mais', 'menos', 'muito', 'muita', 'muitos', 'muitas', 'sobre', 'entre',
    'apos', 'após', 'antes', 'depois', 'durante', 'contra', 'desde', 'ate', 'até', 'sem',
    'com', 'por', 'pelo', 'pela', 'pelos', 'pelas', 'num', 'numa', 'nos', 'nas', 'dos', 'das',
    'que', 'quem', 'qual', 'quais', 'quando', 'onde', 'porque', 'pois', 'mas', 'porem', 'porém',
    'ainda', 'tambem', 'também', 'apenas', 'mesmo', 'mesma', 'mesmos', 'mesmas', 'outro', 'outra',
    'outros', 'outras', 'todo', 'toda', 'todos', 'todas', 'cada', 'esse', 'essa', 'esses', 'essas',
    'este', 'esta', 'estes', 'estas', 'isso', 'isto', 'aquele', 'aquela', 'aquilo', 'seu', 'sua',
    'seus', 'suas', 'nosso', 'nossa', 'nossos', 'nossas', 'eles', 'elas', 'voce', 'você', 'voces',
    'vocês', 'foi', 'sao', 'são', 'era', 'eram', 'ser', 'estar', 'está', 'estao', 'estão',
    'tem', 'têm', 'tinha', 'ter', 'teve', 'pode', 'podem', 'podia', 'poder', 'faz', 'fazer', 'fez',
    'disse', 'afirmou', 'segundo', 'conforme', 'brasil', 'hoje', 'ontem', 'amanha', 'amanhã',
    'ano', 'anos', 'mes', 'mês', 'meses', 'dia', 'dias', 'hora', 'horas', 'novo', 'nova', 'novos',
    'novas', 'grande', 'grandes', 'maior', 'menor', 'primeiro', 'primeira', 'ultimo', 'último',
    'ultima', 'última', 'http', 'https', 'www', 'html', 'leia', 'veja', 'confira', 'saiba',
    'nao', 'não', 'sim', 'uma', 'uns', 'umas', 'ele', 'ela', 'aqui', 'ali', 'entao', 'então',
]);

export function stripHtmlAndEntities(text: string): string {
    if (!text) return '';
    return text
        .replace(/<[^>]*>/g, ' ')
        .replace(/&[a-z0-9#]+;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function stripDiacritics(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function extractSignificantTokens(
    text: string,
    maxTokens = 12,
    options?: { normalizeAccents?: boolean },
): string[] {
    const clean = stripHtmlAndEntities(text);
    if (!clean) return [];

    const rawMatches = clean.match(/[A-Za-zÀ-ÖØ-öø-ÿ0-9]{3,}/g) || [];
    const freq = new Map<string, { score: number; token: string }>();

    for (const word of rawMatches) {
        let sanitized = word
            .toLowerCase()
            .replace(/[^a-zà-öø-ÿ0-9]/g, '');
        if (options?.normalizeAccents) {
            sanitized = stripDiacritics(sanitized);
        }
        if (sanitized.length < 3 || /^\d+$/.test(sanitized) || PT_STOP_WORDS.has(sanitized)) {
            continue;
        }
        const isCapitalized = /^[A-ZÀ-ÖØ-Þ]/.test(word);
        const weight = isCapitalized ? 2.5 : 1;
        const current = freq.get(sanitized);
        if (current) {
            current.score += weight;
        } else {
            freq.set(sanitized, { score: weight, token: sanitized });
        }
    }

    return Array.from(freq.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, maxTokens)
        .map(item => item.token);
}

export function computeTokenSetSimilarity(tokensA: string[], tokensB: string[]): {
    score: number;
    sharedCount: number;
} {
    if (tokensA.length === 0 || tokensB.length === 0) {
        return { score: 0, sharedCount: 0 };
    }
    const setA = new Set(tokensA);
    const setB = new Set(tokensB);
    let sharedCount = 0;
    for (const token of setA) {
        if (setB.has(token)) {
            sharedCount++;
        }
    }
    if (sharedCount === 0) {
        return { score: 0, sharedCount: 0 };
    }
    const unionSize = setA.size + setB.size - sharedCount;
    const jaccard = unionSize > 0 ? sharedCount / unionSize : 0;
    const minSize = Math.min(setA.size, setB.size);
    const overlap = minSize > 0 ? sharedCount / minSize : 0;
    return {
        score: Number((0.6 * jaccard + 0.4 * overlap).toFixed(4)),
        sharedCount,
    };
}

export function resolveNewsAuthor(news: Partial<News>): string {
    const candidates = [
        news?.sourceName,
        news?.source,
        news?.sourceInfo?.name,
        news?.sourceInfo?.domain,
    ];
    for (const candidate of candidates) {
        const cleaned = (candidate || '').trim();
        if (cleaned) return cleaned;
    }
    return 'Autor desconhecido';
}
