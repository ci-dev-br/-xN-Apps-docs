import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { News } from '../models/news.entity';
import { Category } from '../models/category.entity';
import { Source } from '../models/source.entity';
// Importe a entidade e o enum de eventos
import { CategoryEvent, CategoryEventType } from '../models/category-event.entity';

@Injectable()
export class ScraperService implements OnModuleInit {
  private readonly logger = new Logger(ScraperService.name);

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
    // INJETE O NOVO REPOSITÓRIO AQUI:
    @InjectRepository(CategoryEvent)
    private categoryEventRepository: Repository<CategoryEvent>,
    private readonly httpService: HttpService,
  ) { }

  // Substitui a chamada no construtor para evitar problemas de concorrência na inicialização
  async onModuleInit() {
    await this.seedSources();
    await this.catalogTrendingCategories();
    await this.scrapeNewsData(); // Removido do boot inicial para não sobrecarregar
  }

  // =====================================================================
  // INICIALIZAÇÃO DE FONTES (SEED)
  // =====================================================================
  private async seedSources() {
    const count = await this.sourceRepository.count();
    if (count === 0) {
      this.logger.log('Cadastrando fontes de notícias iniciais...');

      const defaultSources = [
        {
          name: 'Google News',
          searchUrlTemplate: 'https://news.google.com/rss/search?q={{query}}&hl=pt-BR&gl=BR&ceid=BR:pt-419',
          characteristics: { reliability: 'high', requiresProxy: false }
        },
        {
          name: 'Bing News',
          searchUrlTemplate: 'https://www.bing.com/news/search?q={{query}}&format=rss',
          characteristics: { reliability: 'medium', requiresProxy: false }
        },
        {
          name: 'Yahoo News Brasil',
          // O Yahoo usa parâmetros específicos na URL de RSS
          searchUrlTemplate: 'https://br.news.yahoo.com/rss/search?p={{query}}',
          characteristics: { reliability: 'medium', requiresProxy: false }
        }
      ];

      for (const src of defaultSources) {
        await this.sourceRepository.save(this.sourceRepository.create(src));
      }
    }
  }

  // =====================================================================
  // SISTEMA DE FEEDBACK DA FONTE
  // =====================================================================
  private async registerSourceFeedback(source: Source, isSuccess: boolean) {
    source.totalRequests += 1;

    if (isSuccess) {
      source.successfulRequests += 1;
      source.consecutiveErrors = 0; // Reseta o contador de erros
    } else {
      source.consecutiveErrors += 1;
      // Regra de negócio dinâmica: Se falhar 5 vezes seguidas, desativa a fonte.
      if (source.consecutiveErrors >= 5) {
        source.isActive = false;
        this.logger.warn(`⚠️ Fonte "${source.name}" foi DESATIVADA devido a 5 erros consecutivos.`);
      }
    }

    await this.sourceRepository.save(source);
  }

  // =====================================================================
  // BUSCA DE NOTÍCIAS MULTI-FONTES
  // =====================================================================
  @Cron(CronExpression.EVERY_HOUR)
  async scrapeNewsData() {
    this.logger.log('Iniciando scraper de notícias multi-fontes (1h)...');

    const categories = await this.categoryRepository.find({ where: { isTrending: true } });
    const activeSources = await this.sourceRepository.find({ where: { isActive: true } });

    if (activeSources.length === 0) {
      this.logger.error('Nenhuma fonte de busca ativa disponível!');
      return;
    }

    for (const category of categories) {
      for (const source of activeSources) {
        try {
          // Substitui a tag {{query}} pelo nome da categoria
          const feedUrl = source.searchUrlTemplate.replace('{{query}}', encodeURIComponent(category.name));

          const feed = await this.rssParser.parseURL(feedUrl);

          for (const item of feed.items) {
            try {
              const exists = await this.newsRepository.findOneBy({ url: item.link });

              if (!exists) {
                const extractedText = await this.scrapePageContent(item.link);

                const news = this.newsRepository.create({
                  title: item.title,
                  url: item.link,
                  sourceName: item.creator || item['source'] || source.name,
                  content: extractedText,
                  category: category,
                  sourceInfo: source, // Vincula à nova tabela
                });
                await this.newsRepository.save(news);
              }
            } catch (itemError) {
              if (itemError.code !== '23505') {
                this.logger.error(`Erro ao salvar a notícia "${item.title}"`, itemError.message);
              }
            }
          }

          // Feedback de sucesso para a fonte
          await this.registerSourceFeedback(source, true);

        } catch (error) {
          this.logger.warn(`Erro na fonte ${source.name} ao buscar "${category.name}": ${error.message}`);
          // Feedback de erro para a fonte
          await this.registerSourceFeedback(source, false);
        }
      }
      this.logger.log(`Notícias atualizadas para a categoria: ${category.name}`);
    }
  }
  // =====================================================================
  // CATALOGAÇÃO DE TENDÊNCIAS (Com Histórico de Eventos)
  // =====================================================================
  @Cron(CronExpression.EVERY_30_MINUTES)
  async catalogTrendingCategories() {
    this.logger.log('Buscando assuntos em alta (Google Trends) e atualizando histórico...');

    try {
      const trendsUrl = 'https://trends.google.com/trending/rss';
      const feed = await this.rssParser.parseURL(trendsUrl);

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

      // 1. Desmarca quem caiu e REGISTRA O EVENTO DE QUEDA
      const obsoleteTrends = currentDbTrends.filter(dbTrend => !feedTrendNames.includes(dbTrend.name));

      for (const obsolete of obsoleteTrends) {
        obsolete.isTrending = false;
        obsolete.trendVolume = 0;
        await this.categoryRepository.save(obsolete);

        // Salva evento no histórico
        await this.categoryEventRepository.save(
          this.categoryEventRepository.create({
            category: obsolete,
            type: CategoryEventType.TREND_ENDED,
            volume: 0,
          })
        );
        this.logger.log(`[Queda] Categoria deixou de ser tendência: ${obsolete.name}`);
      }

      // 2. Atualiza tendências atuais e REGISTRA EVENTOS DE MUDANÇA
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
            this.categoryEventRepository.create({
              category: category,
              type: CategoryEventType.TREND_STARTED,
              volume: trend.volume,
            })
          );
          this.logger.log(`[Nova Tendência] ${category.name} (Vol: ${category.trendVolume})`);
        } else {
          // TENDÊNCIA EXISTENTE
          const volumeChanged = category.trendVolume !== trend.volume;
          const wasNotTrending = category.isTrending === false;

          category.isTrending = true;
          category.trendVolume = trend.volume;
          await this.categoryRepository.save(category);

          // Verifica se precisa gerar evento
          if (wasNotTrending) {
            // Se estava esquecida e voltou aos Trending Topics
            await this.categoryEventRepository.save(
              this.categoryEventRepository.create({
                category: category,
                type: CategoryEventType.TREND_RESTARTED,
                volume: trend.volume,
              })
            );
            this.logger.log(`[Re-Tendência] O assunto voltou a subir: ${category.name}`);
          } else if (volumeChanged) {
            // Se apenas mudou de volume (ex: pulou de 50k pra 100k)
            await this.categoryEventRepository.save(
              this.categoryEventRepository.create({
                category: category,
                type: CategoryEventType.VOLUME_CHANGED,
                volume: trend.volume,
              })
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
  // EXTRATOR DE CONTEÚDO
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
}