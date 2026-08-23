import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MacroIndicator } from '../model/macro-indicator.entity';

@Injectable()
export class MacroIndicatorsService {
  constructor(
    @InjectRepository(MacroIndicator)
    private readonly macroRepository: Repository<MacroIndicator>,
  ) { }

  /**
   * Retorna o último valor registrado para cada indicador macroeconômico
   */
  async getLatestIndicators(): Promise<MacroIndicator[]> {
    // Abordagem via QueryBuilder para encontrar o último registro de cada nome

    // Subquery: Encontra a maior data para cada nome de indicador
    const latestDatesSubQuery = this.macroRepository
      .createQueryBuilder('sub_mi')
      .select('sub_mi.name', 'name')
      .addSelect('MAX(sub_mi.date)', 'max_date')
      .groupBy('sub_mi.name');

    // Query principal: Faz um JOIN com a subquery para pegar o registro completo
    const result = await this.macroRepository
      .createQueryBuilder('mi')
      .innerJoin(
        '(' + latestDatesSubQuery.getQuery() + ')',
        'latest',
        'mi.name = latest.name AND mi.date = latest.max_date'
      )
      .orderBy('mi.name', 'ASC')
      .getMany();

    // Dica: A depender do banco (como o Postgres) e se os IDs forem sequenciais, 
    // também é possível fazer isso usando DISTINCT ON (mi.name). 
    // A abordagem com subquery MAX(date) é mais compatível entre diferentes bancos.

    return result;
  }
}