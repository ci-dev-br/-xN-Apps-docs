export enum SiteContentType {
    POST = 'post',
    PAGE = 'page',
    NOTICE = 'notice',
}

export enum SiteContentStatus {
    PUBLICADO = 'publicado',
    RASCUNHO = 'rascunho',
    REVISAO = 'revisao',
    AGENDADO = 'agendado',
}

export enum SiteMediaType {
    IMAGE = 'image',
    PDF = 'pdf',
    VIDEO = 'video',
    AUDIO = 'audio',
    DOCUMENT = 'document',
}

export enum CommentStatus {
    PENDENTE = 'pendente',
    APROVADO = 'aprovado',
    SPAM = 'spam',
    LIXEIRA = 'lixeira',
}

export enum TermTaxonomy {
    CATEGORY = 'category',
    TAG = 'tag',
    NAV_MENU = 'nav_menu',
}

export function normalizeCmsStatus(rawStatus?: string | null): SiteContentStatus {
    const val = (rawStatus || '').trim().toLowerCase();
    if (val === 'publish' || val === 'publicado') return SiteContentStatus.PUBLICADO;
    if (val === 'revisao' || val === 'review' || val === 'pending') return SiteContentStatus.REVISAO;
    if (val === 'agendado' || val === 'scheduled' || val === 'future') return SiteContentStatus.AGENDADO;
    return SiteContentStatus.RASCUNHO;
}
