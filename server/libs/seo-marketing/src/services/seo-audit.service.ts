import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';
import { SeoIssue, SeoPage } from '../models/seo-page.entity';
import { SeoTarefa, SeoTarefaStatus } from '../models/seo-tarefa.entity';

/** Peso de cada severidade no cálculo do score (100 - soma das penalidades). */
const PENALIDADE = { CRITICO: 25, ALERTA: 10, INFO: 3 };
const PRIORIDADE = { CRITICO: 'CRITICA', ALERTA: 'MEDIA', INFO: 'BAIXA' };

/**
 * Auditoria on-page simplificada: baixa o HTML da URL, aplica um conjunto de regras
 * e gera issues + score. Issues CRÍTICAS/ALERTA viram tarefas no backlog do time.
 */
@Injectable()
export class SeoAuditService {
    private readonly logger = new Logger(SeoAuditService.name);
    constructor(
        private readonly http: HttpService,
        @InjectRepository(SeoPage) private readonly pages: Repository<SeoPage>,
        @InjectRepository(SeoTarefa) private readonly tarefas: Repository<SeoTarefa>,
    ) { }

    async auditar(internalId: string): Promise<SeoPage> {
        const page = await this.pages.findOne({ where: { internalId }, relations: ['dominio'] });
        if (!page?.url) throw new Error('Página sem URL para auditoria.');
        const issues: SeoIssue[] = [];
        const add = (codigo: string, severidade: SeoIssue['severidade'], mensagem: string) =>
            issues.push({ codigo, severidade, mensagem });

        const inicio = Date.now();
        let html = '';
        try {
            const res = await firstValueFrom(this.http.get<string>(page.url, {
                timeout: 15000, responseType: 'text', validateStatus: () => true, maxRedirects: 5,
                headers: { 'User-Agent': 'CI-SEO-Auditor/1.0 (+https://ci.dev.br)' },
            }));
            page.statusHttp = res.status;
            html = typeof res.data === 'string' ? res.data : '';
            const robotsHeader = String(res.headers?.['x-robots-tag'] ?? '');
            if (/noindex/i.test(robotsHeader)) add('X_ROBOTS_NOINDEX', 'CRITICO', 'Cabeçalho X-Robots-Tag contém noindex.');
        } catch (e) {
            page.statusHttp = 0;
            add('FETCH_FAILED', 'CRITICO', `Falha ao acessar a URL: ${(e as Error).message}`);
        }
        page.tempoRespostaMs = Date.now() - inicio;

        if (page.statusHttp >= 400) add('HTTP_ERROR', 'CRITICO', `Status HTTP ${page.statusHttp}.`);
        if (page.tempoRespostaMs > 3000) add('SLOW_RESPONSE', 'ALERTA', `Resposta lenta (${page.tempoRespostaMs} ms).`);

        if (html) {
            const $ = cheerio.load(html);
            page.titulo = $('head > title').first().text().trim() || null;
            page.metaDescription = $('meta[name="description"]').attr('content')?.trim() || null;
            page.canonical = $('link[rel="canonical"]').attr('href') || null;
            const robots = $('meta[name="robots"]').attr('content') ?? '';
            page.indexavel = !/noindex/i.test(robots) && !issues.some(i => i.codigo === 'X_ROBOTS_NOINDEX');

            if (!page.titulo) add('TITLE_MISSING', 'CRITICO', 'Tag <title> ausente.');
            else if (page.titulo.length < 30 || page.titulo.length > 60)
                add('TITLE_LENGTH', 'ALERTA', `Título com ${page.titulo.length} caracteres (ideal 30–60).`);
            if (!page.metaDescription) add('META_DESC_MISSING', 'ALERTA', 'Meta description ausente.');
            else if (page.metaDescription.length < 70 || page.metaDescription.length > 160)
                add('META_DESC_LENGTH', 'INFO', `Meta description com ${page.metaDescription.length} caracteres (ideal 70–160).`);
            if (!page.canonical) add('CANONICAL_MISSING', 'INFO', 'Link canonical ausente.');
            if (!page.indexavel) add('NOINDEX', 'CRITICO', 'Página marcada como noindex.');
            const h1 = $('h1').length;
            if (h1 === 0) add('H1_MISSING', 'ALERTA', 'Nenhum <h1> encontrado.');
            if (h1 > 1) add('H1_MULTIPLE', 'INFO', `${h1} tags <h1> encontradas.`);
            const semAlt = $('img:not([alt]), img[alt=""]').length;
            if (semAlt) add('IMG_ALT_MISSING', 'INFO', `${semAlt} imagem(ns) sem atributo alt.`);
            if (!$('html').attr('lang')) add('HTML_LANG_MISSING', 'INFO', 'Atributo lang ausente em <html>.');
            if (!$('meta[name="viewport"]').length) add('VIEWPORT_MISSING', 'ALERTA', 'Meta viewport ausente (mobile).');
            if (!$('script[type="application/ld+json"]').length) add('SCHEMA_MISSING', 'INFO', 'Nenhum dado estruturado JSON-LD.');
            if (!$('meta[property="og:title"]').length) add('OG_MISSING', 'INFO', 'Tags OpenGraph ausentes.');
        }

        page.issues = issues;
        page.score = Math.max(0, 100 - issues.reduce((s, i) => s + PENALIDADE[i.severidade], 0));
        page.ultimaAuditoria = new Date();
        await this.pages.save(page);
        await this.gerarTarefas(page, issues);
        return page;
    }

    /** Cria tarefas para issues CRÍTICO/ALERTA que ainda não possuam tarefa aberta. */
    private async gerarTarefas(page: SeoPage, issues: SeoIssue[]) {
        for (const issue of issues.filter(i => i.severidade !== 'INFO')) {
            const existe = await this.tarefas.createQueryBuilder('t')
                .where('t.paginaInternalId = :p', { p: page.internalId })
                .andWhere('t.codigoIssue = :c', { c: issue.codigo })
                .andWhere('t.status != :s', { s: SeoTarefaStatus.CONCLUIDA })
                .andWhere('(t.deleted IS NULL OR t.deleted = false)')
                .getCount();
            if (existe) continue;
            await this.tarefas.save(this.tarefas.create({
                titulo: `[${issue.codigo}] ${page.url}`,
                descricao: issue.mensagem,
                codigoIssue: issue.codigo,
                prioridade: PRIORIDADE[issue.severidade],
                status: SeoTarefaStatus.ABERTA,
                pagina: page,
                dominio: page.dominio,
            }));
        }
    }
}
