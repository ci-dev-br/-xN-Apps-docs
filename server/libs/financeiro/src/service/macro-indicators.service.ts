import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MacroIndicator } from '../model/macro-indicator.entity';
import { BcbScraperService } from './bcb-scraper.service';

@Injectable()
export class MacroIndicatorsService {
  constructor(
    @InjectRepository(MacroIndicator)
    private readonly macroRepository: Repository<MacroIndicator>,
    private readonly bcbScraperService: BcbScraperService,
  ) { }

  /**
   * Retorna o último valor registrado para cada indicador macroeconômico,
   * garantindo coleta atualizada quando os dados estiverem defasados.
   */
  async getLatestIndicators(): Promise<MacroIndicator[]> {
    await this.bcbScraperService.ensureFreshData();

    const todayStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    // Subquery: Encontra a maior data (até hoje) para cada nome de indicador
    const latestDatesSubQuery = this.macroRepository
      .createQueryBuilder('sub_mi')
      .select('sub_mi.name', 'name')
      .addSelect('MAX(sub_mi.date)', 'max_date')
      .where('sub_mi.date <= :today', { today: todayStr })
      .groupBy('sub_mi.name');

    // Query principal: Faz um JOIN com a subquery para pegar o registro completo
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

    // Garante no máximo 1 item por indicador (o com extração mais recente)
    const uniqueByName = new Map<string, MacroIndicator>();
    for (const row of rows) {
      if (!uniqueByName.has(row.name)) {
        uniqueByName.set(row.name, row);
      }
    }

    return Array.from(uniqueByName.values());
  }
}
