import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MacroIndicator } from '../model/macro-indicator.entity';

@Injectable()
export class BcbScraperService {
    private readonly logger = new Logger(BcbScraperService.name);

    // Mapeamento dos códigos do SGS
    private readonly INDICATORS = [
        { name: 'SELIC', code: 11 },   // Selic Diária
        { name: 'IPCA', code: 433 },   // IPCA Mensal
    ];

    constructor(
        @InjectRepository(MacroIndicator)
        private readonly macroIndicatorRepository: Repository<MacroIndicator>,
    ) {
        console.log('[BcbScraperService]')
        // setTimeout(() => this.fetchMacroIndicators());
    }

    /**
     * Roda todos os dias às 08:00 da manhã
     */
    @Cron(CronExpression.EVERY_DAY_AT_8AM)
    async fetchMacroIndicators() {
        this.logger.log('Iniciando busca de indicadores macroeconômicos no BCB...');

        // O ideal é buscar os últimos 60 dias para garantir que pegaremos as 
        // atualizações mensais (como o IPCA) e cobrir finais de semana/feriados
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 60);

        const dataInicial = this.formatBcbDate(startDate);
        const dataFinal = this.formatBcbDate(endDate);

        for (const indicator of this.INDICATORS) {
            this.logger.debug(`Buscando dados para ${indicator.name}...`);

            const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${indicator.code}/dados?formato=json&dataInicial=${dataInicial}&dataFinal=${dataFinal}`;

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Erro na API do BCB: Status ${response.status}`);
                }

                const data: Array<{ data: string; valor: string }> = await response.json();

                if (data && data.length > 0) {
                    await this.processAndSaveData(indicator.name, data);
                } else {
                    this.logger.warn(`Nenhum dado retornado para ${indicator.name} no período.`);
                }
            } catch (error) {
                this.logger.error(`Erro ao buscar ${indicator.name}: ${error.message}`);
            }
        }

        this.logger.log('Rotina de indicadores do BCB finalizada.');
    }

    /**
     * Processa os dados retornados e salva no banco de dados, evitando duplicatas
     */
    private async processAndSaveData(indicatorName: string, data: Array<{ data: string; valor: string }>) {
        let insertedCount = 0;

        for (const record of data) {
            // API do BCB retorna a data no formato DD/MM/YYYY
            const parsedDate = this.parseBcbDate(record.data);
            const value = parseFloat(record.valor);

            // Verifica se já existe para não duplicar
            const existingRecord = await this.macroIndicatorRepository.findOne({
                where: {
                    name: indicatorName,
                    date: parsedDate,
                },
            });

            if (!existingRecord) {
                const newIndicator = this.macroIndicatorRepository.create({
                    name: indicatorName,
                    date: parsedDate,
                    value: value,
                });

                await this.macroIndicatorRepository.save(newIndicator);
                insertedCount++;
            }
        }

        if (insertedCount > 0) {
            this.logger.log(`✅ ${insertedCount} novos registros salvos para ${indicatorName}.`);
        } else {
            this.logger.debug(`Nenhum registro novo para salvar de ${indicatorName}.`);
        }
    }

    /**
     * Converte o objeto Date do Node para o formato DD/MM/YYYY exigido pelo BCB
     */
    private formatBcbDate(date: Date): string {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    /**
     * Converte a string DD/MM/YYYY do BCB para um objeto Date válido pro TypeORM
     */
    private parseBcbDate(bcbDateStr: string): Date {
        const [day, month, year] = bcbDateStr.split('/');
        // Formato YYYY-MM-DD é o mais seguro para instanciar datas e salvar no SQL
        return new Date(`${year}-${month}-${day}T00:00:00Z`);
    }
}