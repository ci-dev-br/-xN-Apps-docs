import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './../model/asset.entity';
import { FinancialStatement } from './../model/financial-statement.entity';

@Injectable()
export class FinancialsService {
    constructor(
        @InjectRepository(Asset)
        private readonly assetRepository: Repository<Asset>,
        @InjectRepository(FinancialStatement)
        private readonly statementRepository: Repository<FinancialStatement>,
    ) { }

    async getLatestFinancials(ticker: string) {
        // 1. Busca o ativo e carrega o relacionamento com a Empresa
        const asset = await this.assetRepository.findOne({
            where: { ticker },
            relations: ['company'],
        });

        if (!asset) {
            throw new NotFoundException(`Ativo com ticker ${ticker} não encontrado.`);
        }

        // 2. Busca a demonstração consolidada mais recente da empresa
        const statement = await this.statementRepository.findOne({
            where: {
                company: { id: asset.company.id },
                statementType: 'CONSOLIDADO'
            },
            order: { referenceDate: 'DESC' }, // Ordena da data mais recente para a mais antiga
        });

        if (!statement) {
            throw new NotFoundException(`Nenhum balanço encontrado para a empresa ${asset.company.name}.`);
        }

        // 3. Formata e retorna os dados brutos convertendo decimais (strings no DB) para números
        return {
            companyName: asset.company.name,
            referenceDate: statement.referenceDate,
            documentType: statement.documentType, // 'DFP' ou 'ITR'
            netRevenue: Number(statement.netRevenue),
            ebitda: Number(statement.ebitda),
            netIncome: Number(statement.netIncome),
            totalAssets: Number(statement.totalAssets),
            equity: Number(statement.equity),
            grossDebt: Number(statement.grossDebt),
        };
    }
}