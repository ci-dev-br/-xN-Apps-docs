import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MacroIndicator } from '../model/macro-indicator.entity';
import { BcbScraperService, CRYPTO_INDICATOR_NAMES } from './bcb-scraper.service';

export type MacroIndicatorWithQueryMeta = MacroIndicator & { queriedAt: string };

@Injectable()
export class MacroIndicatorsService {
  private readonly cryptoSet = new Set<string>(CRYPTO_INDICATOR_NAMES);

  constructor(
    @InjectRepository(MacroIndicator)
    private readonly macroRepository: Repository<MacroIndicator>,
    private readonly bcbScraperService: BcbScraperService,
  ) { }

  /**
   * Retorna o último valor registrado para cada indicador macroeconômico,
   * diferenciando claramente a data de extração na fonte (extractedAt)
   * da data de consulta na base (queriedAt).
   */
  async getLatestIndicators(options?: { includeCrypto?: boolean }): Promise<MacroIndicatorWithQueryMeta[]> {
    const includeCrypto = Boolean(options?.includeCrypto);
    await this.bcbScraperService.ensureFreshData(includeCrypto);

    const rows = await this.queryLatestRows();
    const queriedAt = new Date().toISOString();

    return rows
      .filter(row => includeCrypto || !this.cryptoSet.has(row.name))
      .map(row => ({
        ...row,
        queriedAt,
      }));
  }

  /**
   * Retorna os últimos valores dos índices e cotações públicas de criptomoedas.
   */
  async getCryptoIndicators(): Promise<MacroIndicatorWithQueryMeta[]> {
    await this.bcbScraperService.ensureFreshData(true);

    const rows = await this.queryLatestRows();
    const queriedAt = new Date().toISOString();

    return rows
      .filter(row => this.cryptoSet.has(row.name))
      .map(row => ({
        ...row,
        queriedAt,
      }));
  }

  private async queryLatestRows(): Promise<MacroIndicator[]> {
    const todayStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    const latestDatesSubQuery = this.macroRepository
      .createQueryBuilder('sub_mi')
      .select('sub_mi.name', 'name')
      .addSelect('MAX(sub_mi.date)', 'max_date')
      .where('sub_mi.date <= :today', { today: todayStr })
      .groupBy('sub_mi.name');

    const rows = await this.macroRepository
      .createQueryBuilder('mi')
      .innerJoin(
        '(' + latestDatesSubQuery.getQuery() + ')',
        'latest',
        'mi.name = latest.name AND mi.date = latest.max_date',
      )
      .setParameters(latestDatesSubQuery.getParameters())
      .orderBy('mi.name', 'ASC')
      .addOrderBy('mi.extractedAt', 'DESC', 'NULLS LAST')
      .getMany();

    const uniqueByName = new Map<string, MacroIndicator>();
    for (const row of rows) {
      if (!uniqueByName.has(row.name)) {
        uniqueByName.set(row.name, row);
      }
    }

    return Array.from(uniqueByName.values());
  }
}
