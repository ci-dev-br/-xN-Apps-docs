import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MacroIndicator } from '../model/macro-indicator.entity';
import { IndicatorConfig } from '../model/indicator-config.entity';

@Injectable()
export class BcbScraperService implements OnModuleInit {
    private readonly logger = new Logger(BcbScraperService.name);

    // Mapeamento dos códigos do SGS (Sistema Gerenciador de Séries Temporais - BCB)
    private readonly INDICATORS = [
        // --- Taxas Básicas de Juros ---
        { name: 'SELIC', code: 11 },         // Taxa Selic apurada diariamente (% a.d.)
        { name: 'META_SELIC', code: 432 },   // Taxa Meta Selic fixada pelo COPOM (% a.a.)
        { name: 'CDI', code: 12 },           // Taxa CDI apurada diariamente (% a.d.) - Principal benchmark de Renda Fixa

        // --- Inflação ---
        { name: 'IPCA', code: 433 },         // IPCA - Índice Nacional de Preços ao Consumidor Amplo (% a.m.)
        { name: 'IGPM', code: 189 },         // IGP-M - Índice Geral de Preços do Mercado (% a.m.) - Inflação do aluguel

        // --- Câmbio (Cotação Diária) ---
        { name: 'DOLAR', code: 1 },          // Taxa de câmbio - Dólar comercial (Venda)
        { name: 'EURO', code: 21619 },       // Taxa de câmbio - Euro (Venda)

        // --- Outros ---
        { name: 'POUPANCA', code: 195 },     // Rendimento mensal da Poupança (% a.m.)
    ];

    constructor(
        @InjectRepository(MacroIndicator)
        private readonly macroIndicatorRepository: Repository<MacroIndicator>,
        @InjectRepository(IndicatorConfig)
        private readonly indicatorConfigRepository: Repository<IndicatorConfig>,
    ) {
        console.log('[BcbScraperService]');
        setTimeout(() => this.fetchMacroIndicators())
    }

    // ... (mantenha a lista de INDICATORS e o construtor iguais)

    // 1. O NestJS vai chamar esse método automaticamente ao rodar "npm run start"
    async onModuleInit() {
        this.logger.log('Verificando carga inicial de dados macroeconômicos...');

        // Verifica se já existe algum dado na tabela
        const count = await this.macroIndicatorRepository.count();

        if (count === 0) {
            this.logger.warn('Tabela de indicadores está vazia! Forçando a primeira carga agora...');
            await this.fetchMacroIndicators();
        } else {
            this.logger.log(`Tabela já possui ${count} registros. Aguardando próximo Cron.`);
        }
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
        startDate.setDate(endDate.getDate() - 30);

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