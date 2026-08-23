import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import yahooFinance from 'yahoo-finance2';
import { DailyQuote } from '../model/daily-quote.entity';
import { Asset } from '../model/asset.entity';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(DailyQuote)
    private readonly quoteRepository: Repository<DailyQuote>,
  ) {
    setTimeout(() => {
      this.fetchDailyQuotes();
    })
  }

  /**
   * Roda de Segunda a Sexta às 19:00 (após o fechamento da B3)
   */
  @Cron('0 19 * * 1-5')
  async fetchDailyQuotes() {
    this.logger.log('Iniciando rotina de extração de cotações (Yahoo Finance)...');

    // 1. Busca todos os ativos cadastrados no banco
    const assets = await this.assetRepository.find();

    if (assets.length === 0) {
      this.logger.warn('Nenhum ativo cadastrado para buscar cotações.');
      return;
    }

    // A data base para a busca será o dia atual (ou o dia anterior dependendo da hora)
    const queryDate = new Date();
    // Yahoo finance exige formato YYYY-MM-DD
    const period1 = queryDate.toISOString().split('T')[0];

    for (const asset of assets) {
      try {
        // ATENÇÃO: Para ativos da B3 no Yahoo Finance, é necessário o sufixo '.SA'
        // Ex: PETR4 -> PETR4.SA
        const yahooTicker = `${asset.ticker}.SA`;

        this.logger.debug(`Buscando cotação para ${yahooTicker}...`);

        // Busca o histórico de 1 dia (para garantir que pegamos o fechamento de hoje)
        const historical: any = await yahooFinance.historical(yahooTicker, {
          period1, // A partir de hoje
        });

        if (historical && historical.length > 0) {
          // Pega o registro mais recente retornado
          const data = historical[historical.length - 1];

          // 2. Verifica se a cotação já existe para não duplicar
          const quoteDate = data.date; // já vem como objeto Date

          const existingQuote = await this.quoteRepository.findOne({
            where: {
              asset: { id: asset.id },
              date: quoteDate,
            },
          });

          if (!existingQuote) {
            // 3. Salva a nova cotação no banco
            const newQuote = this.quoteRepository.create({
              asset: asset,
              date: quoteDate,
              open: data.open,
              high: data.high,
              low: data.low,
              close: data.close,
              volume: data.volume,
            });

            await this.quoteRepository.save(newQuote);
            this.logger.log(`✅ Cotação salva para ${asset.ticker}: R$ ${data.close}`);
          } else {
            this.logger.debug(`Cotação já existe para ${asset.ticker} na data ${quoteDate.toISOString().split('T')[0]}`);
          }
        }
      } catch (error) {
        // Usamos try/catch dentro do loop para que o erro de uma ação não pare a extração das outras
        this.logger.error(`Erro ao buscar dados para ${asset.ticker}: ${error.message}`);
      }
    }

    this.logger.log('Rotina de extração finalizada.');
  }
}