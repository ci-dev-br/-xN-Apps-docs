import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';

// Entidades baseadas na sua estrutura
import { Source, SourceStatus } from '../models/source.entity';
import { Category } from '../models/category.entity';
import { News } from '../models/news.entity';

@Injectable()
export class DiscoveryService implements OnModuleInit {
    private readonly logger = new Logger(DiscoveryService.name);
    private isDiscoveryRunning = false;

    constructor(
        @InjectRepository(Source)
        private sourceRepository: Repository<Source>,
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
        @InjectRepository(News)
        private newsRepository: Repository<News>,
        private readonly httpService: HttpService,
    ) { }

    // =====================================================================
    // BOOT DA APLICAÇÃO (NON-BLOCKING)
    // =====================================================================
    async onModuleInit() {
        // Inicia 15 segundos após o boot para não competir com o scraper principal
        setTimeout(() => {
            this.startDiscoveryLoop().catch(e =>
                this.logger.error('Erro fatal no worker de discovery:', e)
            );
        }, 15000);
        setTimeout(() => {
            this.startDiscoveryLoop().catch(e =>
                this.logger.error('Erro fatal no worker de discovery:', e)
            );
        }, 15000);
        setTimeout(() => {
            this.startDiscoveryLoop().catch(e =>
                this.logger.error('Erro fatal no worker de discovery:', e)
            );
        }, 15000);
        setTimeout(() => {
            this.startDiscoveryLoop().catch(e =>
                this.logger.error('Erro fatal no worker de discovery:', e)
            );
        }, 15000);
    }

    // =====================================================================
    // ORQUESTRADOR: ROUND-ROBIN DAS 4 ESTRATÉGIAS
    // =====================================================================
    private async startDiscoveryLoop() {
        if (this.isDiscoveryRunning) return;
        this.isDiscoveryRunning = true;

        this.logger.log('🕵️ Worker de Descoberta (Source Discovery) iniciado.');

        // Fila de estratégias (fazemos o bind do 'this' para manter o contexto)
        const strategies = [
            this.strategyDorking.bind(this),
            this.strategyAggregators.bind(this),
            this.strategyCTLogs.bind(this),
            this.strategyBroadCrawling.bind(this),
            this.strategyPartnerSources.bind(this), // <--- Nova Estratégia 5
        ];

        while (true) {
            try {
                const currentStrategy = strategies.shift();
                strategies.push(currentStrategy); // Joga pro final da fila (Round-Robin)

                await currentStrategy();

                // Pausa de 30 minutos entre cada execução de estratégia
                this.logger.log('Aguardando 30 minutos para a próxima estratégia de descoberta...');
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                this.logger.error('Erro no ciclo de descoberta. Retentando em 5 minutos...', error);
                await new Promise(resolve => setTimeout(resolve, 10000));
            }
        }
    }

    // =====================================================================
    // ESTRATÉGIA 1: SEARCH ENGINE DORKING (DuckDuckGo Lite)
    // =====================================================================
    private async strategyDorking() {
        this.logger.log('[Discovery] Executando Estratégia 1: Search Engine Dorking...');

        // Pega uma categoria em alta aleatória
        const categories = await this.categoryRepository.find({ where: { isTrending: true } });
        if (!categories.length) return;
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];

        try {
            // Dork simples: procurando blogs/sites sobre o assunto
            const query = encodeURIComponent(`"${randomCategory.name}" blog OR news`);
            const url = `https://html.duckduckgo.com/html/?q=${query}`;

            const response = await firstValueFrom(
                this.httpService.get(url, { headers: this.getDefaultHeaders() })
            );

            const $ = cheerio.load(response.data);
            const links = [];

            $('a.result__url').each((_, el) => {
                const href = $(el).attr('href');
                if (href) links.push(href);
            });

            for (const link of links) { // Testar os 5 primeiros resultados
                await this.tryExtractRssFromDomain(link);
            }
        } catch (e) {
            this.logger.warn(`Falha no Dorking: ${e.message}`);
        }
    }

    // =====================================================================
    // ESTRATÉGIA 5: BUSCA DE PARCEIROS (HOMEPAGE CRAWLING)
    // =====================================================================
    private async strategyPartnerSources() {
        this.logger.log('[Discovery] Executando Estratégia 5: Busca de Parceiros (Homepage Crawling)...');

        try {
            // Pega todas as fontes ativas já validadas pelo seu sistema
            const activeSources = await this.sourceRepository.find({
                where: { status: SourceStatus.ACTIVE },
            });

            if (activeSources.length === 0) return;

            // Vamos investigar 3 fontes aleatórias por ciclo para manter a fila rodando.
            // O processo é: abre a fonte A -> investiga -> abre a fonte B -> investiga...
            for (let i = 0; i < 15; i++) {
                const randomSource = activeSources[Math.floor(Math.random() * activeSources.length)];
                const homepageUrl = `https://${randomSource.domain}`;

                this.logger.log(`[Discovery] Investigando parceiros na homepage de: ${homepageUrl}`);

                const response = await firstValueFrom(
                    this.httpService.get(homepageUrl, { headers: this.getDefaultHeaders(), timeout: 2000 }).pipe()
                ).catch(() => null);

                if (!response) continue; // Pula silenciosamente se o site principal falhar

                const $ = cheerio.load(response.data);
                const externalDomains = new Set<string>();

                // Vasculha todos os links da página inicial
                $('a[href^="http"]').each((_, el) => {
                    const href = $(el).attr('href');
                    try {
                        const urlObj = new URL(href);

                        // FILTRO CRUCIAL:
                        // 1. O domínio do link não pode ser o domínio atual.
                        // 2. Devemos ignorar redes sociais genéricas e big techs, pois elas sempre 
                        // estarão nos footers e não são "novas fontes de notícias".
                        if (
                            urlObj.hostname !== randomSource.domain &&
                            !urlObj.hostname.includes('facebook.') &&
                            !urlObj.hostname.includes('twitter.') &&
                            !urlObj.hostname.includes('x.com') &&
                            !urlObj.hostname.includes('instagram.') &&
                            !urlObj.hostname.includes('linkedin.') &&
                            !urlObj.hostname.includes('youtube.') &&
                            !urlObj.hostname.includes('tiktok.') &&
                            !urlObj.hostname.includes('google.') &&
                            !urlObj.hostname.includes('apple.') &&
                            !urlObj.hostname.includes('whatsapp.')
                        ) {
                            // Salva apenas a raiz do parceiro (ex: https://parceiro.com)
                            externalDomains.add(urlObj.origin);
                        }
                    } catch (err) {
                        // Ignora links malformados
                    }
                });

                // Converte para array. Limitamos a 5 parceiros por homepage para evitar 
                // gargalos caso um site tenha um rodapé gigante com 50 links.
                const partnersToTest = Array.from(externalDomains);

                if (partnersToTest.length > 0) {
                    this.logger.log(`[Discovery] Encontrados ${partnersToTest.length} possíveis parceiros externos. Testando...`);

                    for (const partnerUrl of partnersToTest) {
                        // Reutilizamos a inteligência já criada para caçar o RSS deste parceiro
                        await this.tryExtractRssFromDomain(partnerUrl);
                    }
                }

                // Pequena pausa (3 segundos) entre a investigação de uma fonte e outra
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } catch (e) {
            this.logger.warn(`Falha na busca de parceiros: ${e.message}`);
        }
    }

    // =====================================================================
    // ESTRATÉGIA 2: RASTREAMENTO DE AGREGADORES (Ex: Reddit .json)
    // =====================================================================
    private async strategyAggregators() {
        this.logger.log('[Discovery] Executando Estratégia 2: Rastreamento de Agregadores...');

        const subreddits = ['news', 'technology', 'worldnews', 'science'];
        const randomSub = subreddits[Math.floor(Math.random() * subreddits.length)];

        try {
            const response = await firstValueFrom(
                this.httpService.get(`https://www.reddit.com/r/${randomSub}/new.json?limit=20`, {
                    headers: this.getDefaultHeaders(),
                })
            );

            const posts = response.data?.data?.children || [];
            for (const post of posts) {
                const url = post.data?.url;
                // Se for um link externo (não é postagem de texto do próprio reddit)
                if (url && !url.includes('reddit.com') && !url.includes('i.redd.it')) {
                    await this.tryExtractRssFromDomain(url);
                }
            }
        } catch (e) {
            this.logger.warn(`Falha em Agregadores (Reddit): ${e.message}`);
        }
    }

    // =====================================================================
    // ESTRATÉGIA 3: BROAD CRAWLING (Outbound Links)
    // =====================================================================
    private async strategyBroadCrawling() {
        this.logger.log('[Discovery] Executando Estratégia 3: Broad Crawling (Outbound Links)...');

        try {
            // Pega 10 notícias recentes cadastradas no seu banco
            const recentNews = await this.newsRepository.find({
                order: { id: 'DESC' }, // Ajuste para sua coluna de datação/ID
                take: 25,
            });

            for (const news of recentNews) {
                const response = await firstValueFrom(
                    this.httpService.get(news.url, { headers: this.getDefaultHeaders(), timeout: 2000 }).pipe()
                ).catch(() => null);

                if (!response) continue;

                const $ = cheerio.load(response.data);
                const baseUrl = new URL(news.url);

                const outboundLinks = new Set<string>();

                // Captura links que apontam para FORA do domínio atual
                $('a[href^="http"]').each((_, el) => {
                    const href = $(el).attr('href');
                    try {
                        const outUrl = new URL(href);
                        if (outUrl.hostname !== baseUrl.hostname) {
                            outboundLinks.add(outUrl.origin); // Guarda só a raiz do site
                        }
                    } catch (err) { }
                });

                // Testa no máximo 3 domínios de saída por notícia para não gargalar
                const linksToTest = Array.from(outboundLinks);
                for (const outLink of linksToTest) {
                    await this.tryExtractRssFromDomain(outLink);
                }
            }
        } catch (e) {
            this.logger.warn(`Falha no Broad Crawling: ${e.message}`);
        }
    }

    // =====================================================================
    // ESTRATÉGIA 4: MONITORAMENTO DE CT LOGS (Certificate Transparency)
    // =====================================================================
    private async strategyCTLogs() {
        this.logger.log('[Discovery] Executando Estratégia 4: CT Logs (Certificados novos)...');

        // Usamos o crt.sh (serviço público) para buscar domínios recém registrados com a palavra "news" ou "blog"
        const terms = ['news', 'blog', 'journal', 'post'];
        const randomTerm = terms[Math.floor(Math.random() * terms.length)];

        try {
            const response = await firstValueFrom(
                this.httpService.get(`https://crt.sh/?q=${randomTerm}&output=json`, {
                    timeout: 2000,
                })
            );

            const certs = response.data || [];
            // Pega domínios únicos da resposta (crt.sh retorna muitos duplicados)
            const uniqueDomains = [...new Set(certs.map(c => c.common_name))]
                .filter(d => typeof d === 'string' && !d.includes('*'))
                ;// .slice(0, 50); // Processar os 10 primeiros

            for (const domain of uniqueDomains) {
                const url = `https://${domain}`;
                await this.tryExtractRssFromDomain(url);
            }
        } catch (e) {
            this.logger.warn(`Falha em CT Logs: ${e.message}`);
        }
    }

    // =====================================================================
    // UTILITÁRIOS: EXTRAÇÃO DE RSS E REGISTRO
    // =====================================================================

    /**
     * Visita uma URL e tenta encontrar a tag <link type="application/rss+xml">
     */
    private async tryExtractRssFromDomain(url: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(url, { headers: this.getDefaultHeaders(), timeout: 2000 })
            );

            const $ = cheerio.load(response.data);
            let rssHref = $('link[type="application/rss+xml"]').attr('href') ||
                $('link[type="application/atom+xml"]').attr('href');

            if (rssHref) {
                // Resolve URL relativa caso exista
                const absoluteRssUrl = new URL(rssHref, url).toString();
                await this.registerDiscoveredSource(absoluteRssUrl, new URL(url).hostname);
            } else {
                // Fallback: Tentativa de adivinhação do endpoint padrão
                await this.guessCommonRssEndpoints(url);
            }
        } catch (error) {
            // Falhas normais (sites indisponíveis, block de bot, etc)
        }
    }

    /**
     * Caso o HTML não tenha a tag, tenta bater nos endpoints padrões de CMS (WordPress, etc)
     */
    private async guessCommonRssEndpoints(baseUrl: string) {
        const endpoints = ['/feed', '/rss', '/feed.xml'];
        for (const endpoint of endpoints) {
            const url = new URL(endpoint, baseUrl).toString();
            try {
                const response = await firstValueFrom(
                    this.httpService.head(url, { headers: this.getDefaultHeaders(), timeout: 2000 })
                );

                const contentType: string = (response.headers['content-type'] || '') as string;
                if (contentType.includes('xml') || contentType.includes('rss')) {
                    await this.registerDiscoveredSource(url, new URL(baseUrl).hostname);
                    break; // Encontrou um, para de tentar os outros
                }
            } catch (err) { }
        }
    }

    /**
     * Salva a fonte no banco como DISCOVERED (Ponte com o Scraper principal)
     */
    private async registerDiscoveredSource(rssUrl: string, domain: string) {
        // Ignorar motores de busca ou agregadores
        if (domain.includes('google') || domain.includes('reddit') || domain.includes('duckduckgo')) {
            return;
        }

        const exists = await this.sourceRepository.findOne({ where: { searchUrlTemplate: rssUrl } });
        if (!exists) {
            let cleanName = domain.replace('www.', '').split('.')[0];
            cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

            const newSource = this.sourceRepository.create({
                name: cleanName,
                searchUrlTemplate: rssUrl,
                domain: domain,
                status: SourceStatus.ACTIVE,
                supportsSearch: true,
            });

            await this.sourceRepository.save(newSource);
            this.logger.log(`🎯 [Descoberta Automática] Nova fonte adicionada à Sandbox: ${cleanName} (${rssUrl})`);
        }
    }

    private getDefaultHeaders() {
        return {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        };
    }
}