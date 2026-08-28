import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as Parser from 'rss-parser';
import * as cheerio from 'cheerio';

// Entidades (Certifique-se de que os caminhos estão corretos na sua estrutura)
import { News } from '../models/news.entity';
import { Category } from '../models/category.entity';
import { Source, SourceStatus } from '../models/source.entity';
import { CategoryEvent, CategoryEventType } from '../models/category-event.entity';

@Injectable()
export class ScraperService implements OnModuleInit {
  private readonly logger = new Logger(ScraperService.name);

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

  // Executado de forma segura assim que o módulo terminar de subir
  async onModuleInit() {
    await this.seedSources();
    await this.catalogTrendingCategories();
  }

  // =====================================================================
  // 1. INICIALIZAÇÃO DE FONTES (SEED)
  // =====================================================================
  private async seedSources() {
    const count = await this.sourceRepository.count();
    if (count === 0) {
      this.logger.log('Cadastrando fontes de notícias iniciais...');

      const defaultSources = [
        {
          name: 'Google News',
          searchUrlTemplate: 'https://news.google.com/rss/search?q={{query}}&hl=pt-BR&gl=BR&ceid=BR:pt-419',
          domain: 'news.google.com',
          status: SourceStatus.ACTIVE,
          supportsSearch: true,
        },
        {
          name: 'Bing News',
          searchUrlTemplate: 'https://www.bing.com/news/search?q={{query}}&format=rss',
          domain: 'bing.com',
          status: SourceStatus.ACTIVE,
          supportsSearch: true,
        },
        {
          name: 'Yahoo News Brasil',
          searchUrlTemplate: 'https://br.news.yahoo.com/rss/search?p={{query}}',
          domain: 'br.news.yahoo.com',
          status: SourceStatus.ACTIVE,
          supportsSearch: true,
        }
      ];

      for (const src of defaultSources) {
        await this.sourceRepository.save(this.sourceRepository.create(src));
      }
    }
  }

  // =====================================================================
  // 2. BUSCA DE NOTÍCIAS MULTI-FONTES
  // =====================================================================
  @Cron(CronExpression.EVERY_HOUR)
  async scrapeNewsData() {
    this.logger.log('Iniciando scraper de notícias multi-fontes (1h)...');

    const categories = await this.categoryRepository.find({ where: { isTrending: true } });

    // Busca apenas as fontes que estão no status ACTIVE
    const activeSources = await this.sourceRepository.find({
      where: { status: SourceStatus.ACTIVE }
    });

    if (activeSources.length === 0) {
      this.logger.error('Nenhuma fonte de busca ativa disponível!');
      return;
    }

    for (const category of categories) {
      for (const source of activeSources) {
        try {
          let feedUrl = source.searchUrlTemplate;

          // Se a fonte suporta pesquisa (ex: Google News), injetamos o termo
          if (source.supportsSearch) {
            feedUrl = feedUrl.replace('{{query}}', encodeURIComponent(category.name));
          }

          const feed = await this.rssParser.parseURL(feedUrl);
          let itemsToProcess = feed.items;

          // Filtro na memória para fontes nativas que não suportam parâmetro ?q=
          if (!source.supportsSearch) {
            const categoryWord = category.name.toLowerCase();
            itemsToProcess = feed.items.filter(item => {
              const title = (item.title || '').toLowerCase();
              const content = (item.contentSnippet || item.content || '').toLowerCase();
              return title.includes(categoryWord) || content.includes(categoryWord);
            });
          }

          for (const item of itemsToProcess.slice(0, 10)) {
            try {
              const exists = await this.newsRepository.findOneBy({ url: item.link });

              if (!exists) {
                // Entra na página para raspar o conteúdo e procurar novos feeds
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
              // Ignora colisões de concorrência no Postgres (Unique Violation)
              if (itemError.code === '23505') {
                this.logger.debug(`Ignorando URL duplicada: ${item.link}`);
              } else {
                this.logger.error(`Erro ao salvar a notícia "${item.title}"`, itemError.message);
              }
            }
          }

          await this.registerSourceFeedback(source, true);
        } catch (error) {
          this.logger.warn(`Erro na fonte ${source.name} ao buscar "${category.name}": ${error.message}`);
          await this.registerSourceFeedback(source, false);
        }
      }
      this.logger.log(`Notícias atualizadas para a categoria: ${category.name}`);
    }
  }

  // =====================================================================
  // 3. CATALOGAÇÃO DINÂMICA DE TENDÊNCIAS COM HISTÓRICO (TIME-SERIES)
  // =====================================================================
  @Cron(CronExpression.EVERY_30_MINUTES)
  async catalogTrendingCategories() {
    this.logger.log('Buscando assuntos em alta (Google Trends) e atualizando histórico...');

    try {
      const trendsUrl = 'https://trends.google.com/trending/rss';
      const feed = await this.rssParser.parseURL(trendsUrl);

      // Limpa os dados de volume
      const feedTrends = feed.items.map(item => {
        const rawTraffic = item['approx_traffic'] || '0';
        const volumeStr = rawTraffic.replace(/\D/g, '');
        return {
          name: item.title,
          volume: parseInt(volumeStr, 10) || 0,
        };
      });

      const feedTrendNames = feedTrends.map(t => t.name);
      const currentDbTrends = await this.categoryRepository.find({ where: { isTrending: true } });

      // Desmarca quem caiu e REGISTRA QUEDA
      const obsoleteTrends = currentDbTrends.filter(dbTrend => !feedTrendNames.includes(dbTrend.name));
      for (const obsolete of obsoleteTrends) {
        obsolete.isTrending = false;
        obsolete.trendVolume = 0;
        await this.categoryRepository.save(obsolete);

        await this.categoryEventRepository.save(
          this.categoryEventRepository.create({
            category: obsolete,
            type: CategoryEventType.TREND_ENDED,
            volume: 0,
          })
        );
        this.logger.log(`[Queda] Categoria deixou de ser tendência: ${obsolete.name}`);
      }

      // Atualiza tendências atuais e REGISTRA MUDANÇAS
      for (const trend of feedTrends) {
        let category = await this.categoryRepository.findOneBy({ name: trend.name });

        if (!category) {
          // NOVA TENDÊNCIA
          category = this.categoryRepository.create({
            name: trend.name,
            isTrending: true,
            trendVolume: trend.volume
          });
          await this.categoryRepository.save(category);

          await this.categoryEventRepository.save(
            this.categoryEventRepository.create({ category, type: CategoryEventType.TREND_STARTED, volume: trend.volume })
          );
          this.logger.log(`[Nova Tendência] ${category.name} (Vol: ${category.trendVolume})`);
        } else {
          // TENDÊNCIA EXISTENTE
          const volumeChanged = category.trendVolume !== trend.volume;
          const wasNotTrending = category.isTrending === false;

          category.isTrending = true;
          category.trendVolume = trend.volume;
          await this.categoryRepository.save(category);

          if (wasNotTrending) {
            await this.categoryEventRepository.save(
              this.categoryEventRepository.create({ category, type: CategoryEventType.TREND_RESTARTED, volume: trend.volume })
            );
            this.logger.log(`[Re-Tendência] O assunto voltou a subir: ${category.name}`);
          } else if (volumeChanged) {
            await this.categoryEventRepository.save(
              this.categoryEventRepository.create({ category, type: CategoryEventType.VOLUME_CHANGED, volume: trend.volume })
            );
            this.logger.debug(`[Volume Atualizado] ${category.name} -> ${trend.volume}`);
          }
        }
      }
      this.logger.log('Sincronização de tendências e histórico finalizada.');
    } catch (error) {
      this.logger.error('Erro ao catalogar tendências', error);
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
          timeout: 10000,
          maxRedirects: 5,
        })
      );

      const $ = cheerio.load(response.data);

      // --- AUTO-DISCOVERY: Garimpo de novos feeds ---
      const rssLink = $('link[type="application/rss+xml"]').attr('href');
      if (rssLink) {
        const absoluteRssUrl = new URL(rssLink, url).toString();
        const domain = new URL(url).hostname;

        this.registerDiscoveredSource(absoluteRssUrl, domain).catch(e =>
          this.logger.debug(`Erro ao registrar fonte descoberta: ${e.message}`)
        );
      }
      // ----------------------------------------------

      $('script, style, nav, footer, header, aside, .paywall-banner, #paywall, .assine-ja').remove();

      let articleContent = '';
      $('article p, main p, .post-content p, .news-content p, .materia-conteudo p').each((i, element) => {
        const text = $(element).text().trim();
        if (text.length > 40 && !text.includes('Assine a Folha') && !text.includes('Leia mais:')) {
          articleContent += text + '\n\n';
        }
      });

      if (!articleContent.trim()) {
        $('p').each((i, element) => {
          const text = $(element).text().trim();
          if (text.length > 50) {
            articleContent += text + '\n\n';
          }
        });
      }
      return articleContent.trim();
    } catch (error) {
      this.logger.debug(`Falha ao burlar proteção/paywall da URL: ${url}`);
      return null;
    }
  }

  // =====================================================================
  // 5. REGISTRO E SANDBOX DE NOVAS FONTES
  // =====================================================================
  private async registerDiscoveredSource(rssUrl: string, domain: string) {
    const exists = await this.sourceRepository.findOne({ where: { searchUrlTemplate: rssUrl } });

    if (!exists) {
      const newSource = this.sourceRepository.create({
        name: domain,
        searchUrlTemplate: rssUrl,
        domain: domain,
        status: SourceStatus.DISCOVERED,
        supportsSearch: false,
      });
      await this.sourceRepository.save(newSource);
      this.logger.log(`🎯 [Auto-Discovery] Nova fonte encontrada: ${domain} (${rssUrl})`);
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
          source.name = feed.title || source.domain;
          source.status = SourceStatus.ACTIVE;
          this.logger.log(`✅ [Sandbox Aprovou] Fonte ${source.name} promovida para ACTIVE.`);
        } else {
          source.status = SourceStatus.SUSPENDED;
          this.logger.warn(`❌ [Sandbox Reprovou] Fonte ${source.domain} retornou feed vazio.`);
        }
      } catch (error) {
        source.status = SourceStatus.SUSPENDED;
        source.consecutiveErrors += 1;
        this.logger.warn(`❌ [Sandbox Reprovou] Erro ao ler RSS de ${source.domain}: ${error.message}`);
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
}