import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Or, Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as Parser from 'rss-parser';
import * as cheerio from 'cheerio';

// Entidades (Certifique-se de que os caminhos refletem a sua estrutura de pastas)
import { News } from '../models/news.entity';
import { Category } from '../models/category.entity';
import { Source, SourceStatus } from '../models/source.entity';
import { CategoryEvent, CategoryEventType } from '../models/category-event.entity';

interface ScrapeTask {
  category: Category;
  source: Source;
}

@Injectable()
export class ScraperService implements OnModuleInit {
  private readonly logger = new Logger(ScraperService.name);
  private isScrapingContinuous = false;

  // Configuramos o parser para ler a tag de tráfego quantitativo do Google Trends
  private rssParser = new Parser({
    customFields: {
      item: [['ht:approx_traffic', 'approx_traffic']],
    },
  });

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(News)
    private newsRepository: Repository<News>,
    @InjectRepository(Source)
    private sourceRepository: Repository<Source>,
    @InjectRepository(CategoryEvent)
    private categoryEventRepository: Repository<CategoryEvent>,
    private readonly httpService: HttpService,
  ) { }

  // =====================================================================
  // BOOT DA APLICAÇÃO (NON-BLOCKING)
  // =====================================================================
  async onModuleInit() {
    try {
      this.logger.log('Iniciando rotinas de base (Cold Start)...');
      await this.seedSources();
      await this.catalogTrendingCategories();

      // Libera o boot do NestJS e joga o worker de raspagem contínua para o background (5 segundos depois)
      setTimeout(() => {
        this.startContinuousScraper().catch(e => this.logger.error('Erro fatal no worker contínuo:', e));
      }, 1000);
      // Libera o boot do NestJS e joga o worker de raspagem contínua para o background (5 segundos depois)
      setTimeout(() => {
        this.startContinuousScraper().catch(e => this.logger.error('Erro fatal no worker contínuo:', e));
      }, 2000);
      setTimeout(() => {
        this.startContinuousScraper().catch(e => this.logger.error('Erro fatal no worker contínuo:', e));
      }, 3000);
      setTimeout(() => {
        this.startContinuousScraper().catch(e => this.logger.error('Erro fatal no worker contínuo:', e));
      }, 4000);
    } catch (error) {
      this.logger.error('Erro ao inicializar dados base no OnModuleInit', error);
    }
  }

  // =====================================================================
  // 1. INICIALIZAÇÃO DE FONTES (SEED)
  // =====================================================================
  private async seedSources() {
    const count = await this.sourceRepository.count();
    if (count === 0) {
      this.logger.log('Base de fontes vazia. Cadastrando fontes iniciais...');

      const defaultSources = [
        { name: 'Google News', searchUrlTemplate: 'https://news.google.com/rss/search?q={{query}}&hl=pt-BR&gl=BR&ceid=BR:pt-419', domain: 'news.google.com', status: SourceStatus.ACTIVE, supportsSearch: true },
        { name: 'Bing News', searchUrlTemplate: 'https://www.bing.com/news/search?q={{query}}&format=rss', domain: 'bing.com', status: SourceStatus.ACTIVE, supportsSearch: true },
        { name: 'Yahoo News', searchUrlTemplate: 'https://news.search.yahoo.com/rss?p={{query}}', domain: 'news.search.yahoo.com', status: SourceStatus.ACTIVE, supportsSearch: true },
        { name: 'Reddit', searchUrlTemplate: 'https://www.reddit.com/search.rss?q={{query}}', domain: 'reddit.com', status: SourceStatus.ACTIVE, supportsSearch: true },
        { name: 'Hacker News', searchUrlTemplate: 'https://hnrss.org/newest?q={{query}}', domain: 'hnrss.org', status: SourceStatus.ACTIVE, supportsSearch: true },
        { name: 'Stack Overflow', searchUrlTemplate: 'https://stackoverflow.com/feeds/tag?tagnames={{query}}&sort=newest', domain: 'stackoverflow.com', status: SourceStatus.ACTIVE, supportsSearch: true },
        { name: 'Medium', searchUrlTemplate: 'https://medium.com/feed/tag/{{query}}', domain: 'medium.com', status: SourceStatus.ACTIVE, supportsSearch: true },
        { name: 'arXiv', searchUrlTemplate: 'http://export.arxiv.org/api/query?search_query=all:{{query}}&start=0&max_results=20', domain: 'export.arxiv.org', status: SourceStatus.ACTIVE, supportsSearch: true },
        { name: 'Flickr', searchUrlTemplate: 'https://www.flickr.com/services/feeds/photos_public.gne?tags={{query}}&format=rss_200', domain: 'flickr.com', status: SourceStatus.ACTIVE, supportsSearch: true }
      ];

      for (const src of defaultSources) {
        await this.sourceRepository.save(this.sourceRepository.create(src));
      }
      this.logger.log('Fontes iniciais cadastradas com sucesso!');
    }
  }

  // =====================================================================
  // 2. WORKER CONTÍNUO (ALWAYS-ON) COM ROUND-ROBIN E MARGEM MINIMA
  // =====================================================================
  private async startContinuousScraper() {
    if (this.isScrapingContinuous) return;
    this.isScrapingContinuous = true;

    this.logger.log('🚀 Worker de raspagem contínua iniciado. Nunca irá parar.');

    while (true) {
      try {
        await this.runScrapeCycle();

        // Pequena pausa entre ciclos completos caso a base de dados esteja vazia, para não fritar a CPU.
        // Se houver tarefas, o ciclo volta imediatamente após processar todas.
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        this.logger.error('Erro no ciclo principal de raspagem. Reiniciando em 10s...', error);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  }

  private async runScrapeCycle() {
    const categories = await this.categoryRepository.find({ where: { isTrending: true } });
    const activeSources = await this.sourceRepository.find({ where: { status: SourceStatus.ACTIVE } });

    if (categories.length === 0 || activeSources.length === 0) {
      return; // Se não houver dados, retorna para o loop aguardar alguns segundos
    }

    // Construção da Fila Round-Robin (Intercala Sites)
    // Resultado gerado: [A(cat1), B(cat1), C(cat1), A(cat2), B(cat2), C(cat2)...]
    const tasks: ScrapeTask[] = [];
    for (const category of categories) {
      for (const source of activeSources) {
        tasks.push({ category, source });
      }
    }

    // Executa a fila de forma síncrona
    for (const task of tasks) {
      // 1. Processamento (O tempo natural de carga de rede atua como o delay principal)
      await this.processSingleTask(task.source, task.category);

      // 2. Margem Mínima (Adiciona rigidamente 45ms extras exigidos)
      await new Promise(resolve => setTimeout(resolve, 45));
    }
  }

  private async processSingleTask(source: Source, category: Category) {
    try {
      let feedUrl = source.searchUrlTemplate;

      if (source.supportsSearch) {
        feedUrl = feedUrl.replace('{{query}}', encodeURIComponent(category.name));
      }

      const feed = await this.rssParser.parseURL(feedUrl);
      let itemsToProcess = feed?.items || [];

      // Filtro local caso a fonte não tenha suporte a query string nativa
      if (!source.supportsSearch) {
        const categoryWord = category.name.toLowerCase();
        itemsToProcess = itemsToProcess.filter(item => {
          const title = (item.title || '').toLowerCase();
          const content = (item.contentSnippet || item.content || '').toLowerCase();
          return title.includes(categoryWord) || content.includes(categoryWord);
        });
      }

      // Processa até 10 resultados para evitar prender numa única categoria/fonte
      for (const item of itemsToProcess.slice(0, 10)) {
        try {
          const exists = await this.newsRepository.findOneBy({ url: item.link });

          if (!exists) {
            // Este método também depende de rede, agregando ao "tempo de espera natural"
            const extractedText = await this.scrapePageContent(item.link);

            const news = this.newsRepository.create({
              title: item.title,
              url: item.link,
              sourceName: item.creator || item['source'] || source.name,
              content: extractedText,
              category: category,
              sourceInfo: source,
            });
            await this.newsRepository.save(news);
          }
        } catch (itemError) {
          if (itemError.code === '23505') {
            // Silencia URL duplicada, é um comportamento normal
          } else {
            this.logger.error(`Erro ao salvar a notícia "${item.title}"`, itemError.message);
          }
        }
      }

      await this.registerSourceFeedback(source, true);
    } catch (error) {
      // Se ocorrer timeout ou erro 403, etc., falha silenciosa para não travar o loop
      await this.registerSourceFeedback(source, false);
    }
  }

  // =====================================================================
  // 3. CATALOGAÇÃO DINÂMICA DE TENDÊNCIAS COM HISTÓRICO (TIME-SERIES)
  // Continua usando Cron, já que as tendências do Google mudam a cada hora/meia-hora
  // =====================================================================
  @Cron(CronExpression.EVERY_30_MINUTES)
  async catalogTrendingCategories() {
    this.logger.log('Buscando assuntos em alta (Google Trends) e atualizando histórico...');

    try {
      const trendsUrl = 'https://trends.google.com/trending/rss';
      const feed = await this.rssParser.parseURL(trendsUrl);
      const items = feed?.items || [];

      const feedTrends = items.map(item => {
        const rawTraffic = item['approx_traffic'] || '0';
        const volumeStr = rawTraffic.replace(/\D/g, '');
        return {
          name: item.title,
          volume: parseInt(volumeStr, 10) || 0,
        };
      });

      const feedTrendNames = feedTrends.map(t => t.name);
      const currentDbTrends = await this.categoryRepository.find({ where: { isTrending: true } });

      const obsoleteTrends = currentDbTrends.filter(dbTrend => !feedTrendNames.includes(dbTrend.name));
      for (const obsolete of obsoleteTrends) {
        obsolete.isTrending = false;
        obsolete.trendVolume = Math.max(obsolete.trendVolume + -10, 0);
        await this.categoryRepository.save(obsolete);
        await this.categoryEventRepository.save(
          this.categoryEventRepository.create({
            category: obsolete,
            type: CategoryEventType.TREND_ENDED,
            volume: obsolete.trendVolume,
          })
        );
      }

      for (const trend of feedTrends) {
        let category = await this.categoryRepository.findOneBy({ name: trend.name });

        if (!category) {
          category = this.categoryRepository.create({
            name: trend.name,
            isTrending: true,
            trendVolume: trend.volume
          });
          await this.categoryRepository.save(category);

          await this.categoryEventRepository.save(
            this.categoryEventRepository.create({ category, type: CategoryEventType.TREND_STARTED, volume: trend.volume })
          );
        } else {
          const volumeChanged = category.trendVolume !== trend.volume;
          const wasNotTrending = category.isTrending === false;

          category.isTrending = true;
          category.trendVolume = trend.volume;
          await this.categoryRepository.save(category);

          if (wasNotTrending) {
            await this.categoryEventRepository.save(
              this.categoryEventRepository.create({ category, type: CategoryEventType.TREND_RESTARTED, volume: trend.volume })
            );
          } else if (volumeChanged) {
            await this.categoryEventRepository.save(
              this.categoryEventRepository.create({ category, type: CategoryEventType.VOLUME_CHANGED, volume: trend.volume })
            );
          }
        }
      }
      this.logger.log('Sincronização de tendências e histórico finalizada.');
    } catch (error) {
      this.logger.error('Erro ao catalogar tendências', error.message);
    }
  }

  // =====================================================================
  // 4. EXTRATOR DE CONTEÚDO ANTI-PAYWALL E CAÇADOR DE RSS
  // =====================================================================
  private async scrapePageContent(url: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            'Referer': 'https://www.google.com/',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': 'no-cache',
          },
          timeout: 4000,
          maxContentLength: 1024 * 4,
          maxRedirects: 4,
        })
      );

      const $ = cheerio.load(response.data);

      // --- AUTO-DISCOVERY: Garimpo de novos feeds ---
      const rssLink = $('link[type="application/rss+xml"]').attr('href');
      if (rssLink) {
        const absoluteRssUrl = new URL(rssLink, url).toString();
        this.registerDiscoveredSource(absoluteRssUrl).catch(() => { });
      }
      // ----------------------------------------------

      $('script, style, nav, footer, header, aside, .paywall-banner, #paywall, .assine-ja').remove();

      let articleContent = '';
      $('article p, main p, .post-content p, .news-content p, .materia-conteudo p').each((i, element) => {
        const text = $(element).text().trim();
        if (text.length > 125 && !text.includes('Assine a Folha') && !text.includes('Leia mais:')) {
          articleContent += text + '\n\n';
        }
      });

      if (!articleContent.trim()) {
        $('p').each((i, element) => {
          const text = $(element).text().trim();
          if (text.length > 512) {
            articleContent += text + '\n\n';
          }
        });
      }
      return articleContent.trim();
    } catch (error) {
      return null;
    }
  }

  // =====================================================================
  // 5. REGISTRO (AUTO-DISCOVERY) E SANDBOX DE NOVAS FONTES
  // =====================================================================
  private async registerDiscoveredSource(rssUrl: string) {
    try {
      const parsedUrl = new URL(rssUrl);
      const domain = parsedUrl.hostname;

      if (domain.includes('google') || domain.includes('bing') || domain.includes('yahoo')) {
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
          status: SourceStatus.DISCOVERED,
          supportsSearch: false,
        });

        await this.sourceRepository.save(newSource);
        this.logger.log(`🎯 [Auto-Discovery] Nova fonte encontrada: ${cleanName} (${rssUrl})`);
      }
    } catch (e) {
      // Falha silenciosa em URLs corrompidas
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async validateDiscoveredSources() {
    this.logger.log('Iniciando Sandbox para testar novas fontes descobertas...');

    const discoveredSources = await this.sourceRepository.find({
      where: { status: SourceStatus.DISCOVERED },
      take: 20
    });

    for (const source of discoveredSources) {
      source.status = SourceStatus.SANDBOX;
      await this.sourceRepository.save(source);

      try {
        const feed = await this.rssParser.parseURL(source.searchUrlTemplate);

        if (feed && feed.items && feed.items.length > 0) {
          source.name = feed.title || source.name;
          source.status = SourceStatus.ACTIVE;
          this.logger.log(`✅ [Sandbox Aprovou] Fonte ${source.name} promovida para ACTIVE.`);
        } else {
          source.status = SourceStatus.SUSPENDED;
        }
      } catch (error) {
        source.status = SourceStatus.SUSPENDED;
        source.consecutiveErrors += 1;
      }

      await this.sourceRepository.save(source);
    }
  }

  // =====================================================================
  // 6. SISTEMA DE FEEDBACK DAS FONTES (AUTO-SUSPENSÃO)
  // =====================================================================
  private async registerSourceFeedback(source: Source, isSuccess: boolean) {
    source.totalRequests += 1;

    if (isSuccess) {
      source.successfulRequests += 1;
      source.consecutiveErrors = 0;
    } else {
      source.consecutiveErrors += 1;
      if (source.consecutiveErrors >= 5) {
        source.status = SourceStatus.SUSPENDED;
        this.logger.warn(`⚠️ Fonte "${source.name}" foi SUSPENSA devido a 5 erros consecutivos.`);
      }
    }
    await this.sourceRepository.save(source);
  }

  // =====================================================================
  // 7. ENDPOINT DO FRONTEND (ALIMENTAÇÃO DO FEED)
  // =====================================================================
  async getTrendingFeed(dataInicial?: Date, dataFinal?: Date, options = {
    limit: 25, offset: 0
  }) {
    this.logger.log(`Gerando feed para o período: ${dataInicial?.toISOString()} a ${dataFinal?.toISOString()}`);
    /*  const categorias = (await this.categoryRepository.find({
       where: [{
         isTrending: true,
       },
       {
         createdAt: Between(dataInicial, dataFinal)
       }]
     })).map(c => c.id); */
    let query = this.newsRepository.createQueryBuilder('news')
      .where(`news."content" is not null and length(news."content") > 512 
and 
news."title" is not null and length(news."title") > 80
and news."url" ilike '%.br/%'`)
      ///.where('news.content is not null')// news.category_id IN (:...categoryIds)', { categoryIds: categorias })
      ;
    /* if (dataInicial) {
      query = query.andWhere('news.scrapedAt >= :dataInicial', { dataInicial });
    } */
    /* if (dataFinal) {
      query = query.andWhere('news.scrapedAt <= :dataFinal', { dataFinal });
    } */
    query = query.orderBy('news.scrapedAt', 'DESC').limit(options.limit).offset(options.offset);
    const newsList = await query.getMany();
    // Passo 3: Agrupar as notícias por Fonte (Source) para montar o FeedColumn
    const columnsMap = new Map<string, any[]>();
    for (const news of newsList) {
      const sourceKey = news.sourceName || 'Diversos';
      if (!columnsMap.has(sourceKey)) {
        columnsMap.set(sourceKey, []);
      }
      // Limita a quantidade de posts por coluna (ex: máx 5 notícias por veículo/fonte)
      /* if (columnsMap.get(sourceKey).length < 100) { */
      if (news.content) {
        columnsMap.get(sourceKey).push({
          id: news.id,
          title: news.title,
          content: news.content,
          link: news.url, // Mapeado para o DTO do frontend
          source: sourceKey,
          date: news.scrapedAt, // Mapeado para o DTO do frontend,
        });
      }
      /* } */
    }
    const feedColumns = Array.from(columnsMap.entries()).map(([mainSource, posts]) => ({
      mainSource,
      posts,
    })).sort((a, b) => b.mainSource.localeCompare(a.mainSource)); // Ordena alfabeticamente por nome da fonte
    // Retorna ordenando pelas colunas que têm mais conteúdo primeiro
    return newsList;// feedColumns.sort((a, b) => b.posts.length - a.posts.length);
  }
  /**
   * Pesquisar por termo e periodo, retornando feed agrupado por fonte (Source) e ordenado por data de publicação.
   * @param dataInicial Data inicial do período de pesquisa (opcional)
   * @param dataFinal Data final do período de pesquisa (opcional)
   */
  async pesquisar(dataInicial?: Date, dataFinal?: Date, textoConsulta?: string) {
    let query = this.newsRepository.createQueryBuilder('news')
      ;
    if (dataInicial) {
      query = query.andWhere('news.scrapedAt >= :dataInicial', { dataInicial });
    }
    if (dataFinal) {
      query = query.andWhere('news.scrapedAt <= :dataFinal', { dataFinal });
    }
    /*  if (textoConsulta) {
       query = query.andWhere('news.title ILIKE :textoConsulta OR news.content ILIKE :textoConsulta', { textoConsulta: `%${textoConsulta.replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('%', '\\%').replaceAll(' ', '%')}%` });
     } */
    query = query.orderBy('news.scrapedAt', 'DESC').limit(10);
    const newsList = await query.getMany();
    // Passo 3: Agrupar as notícias por Fonte (Source) para montar o FeedColumn
    const columnsMap = new Map<string, any[]>();
    for (const news of newsList) {
      const sourceKey = news.sourceName || 'Diversos';
      if (!columnsMap.has(sourceKey)) {
        columnsMap.set(sourceKey, []);
      }
      if (news.content && news.content.length > 100) {
        columnsMap.get(sourceKey).push({
          id: news.id,
          title: news.title,
          content: news.content || '',
          link: news.url, // Mapeado para o DTO do frontend
          source: sourceKey,
          date: news.scrapedAt, // Mapeado para o DTO do frontend
        });
      }
    }
    const feedColumns = Array.from(columnsMap.entries()).map(([mainSource, posts]) => ({
      mainSource,
      posts,
    })).sort((a, b) => b.mainSource.localeCompare(a.mainSource));
    return feedColumns.sort((a, b) => b.posts.length - a.posts.length);
  }
}