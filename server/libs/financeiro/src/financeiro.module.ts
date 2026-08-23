import { Module } from "@nestjs/common";
import { LancamentoFinanceiro } from "./model/lancamento-financeiro.entity";
import { BillingType } from "./model/billing-type.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FaturamentoController } from "./controller/faturamento.controller";
import { Transacao } from "./model/transacao.entity";
import { I11nModule } from "@ci/i11n";
import { CasdastroModule } from "@ci/cadastro";
import { ContaFinanceira } from "./model/conta-financeira.entity";
import { ClienteFinanceiro } from "./model/cliente-financeiro.entity";
import { LancamentoFinanceiroController } from "./controller/lancamento-financeiro.controller";
import { LancamentoFinanceiroService } from "./service/lancamento-financeiro.service";
import { CoreModule } from "@ci/core";
import { ManagerModule } from "@ci/manager";
import { TenantModule } from "@ci/tenant";
import { Asset } from "./model/asset.entity";
import { Company } from "./model/company.entity";
import { DailyQuote } from "./model/daily-quote.entity";
import { FinancialStatement } from "./model/financial-statement.entity";
import { IndicatorsController } from "./controller/indicators.controller";
import { IndicatorsService } from "./service/indicators.service";
import { ScraperService } from "./service/scraper.service";
import { ScheduleModule } from "@nestjs/schedule";
import { MacroIndicator } from "./model/macro-indicator.entity";
import { BcbScraperService } from "./service/bcb-scraper.service";
import { InflationController } from "./controller/inflation.controller";
import { InflationService } from "./service/inflation.service";
import { MacroIndicatorsService } from "./service/macro-indicators.service";
import { MacroIndicatorsController } from "./controller/macro-indicators.controller";
import { FinancialsService } from "./service/financials.service";
import { FinancialsController } from "./controller/financials.controller";
export const FinanceiroEntities = [
    LancamentoFinanceiro,
    BillingType,
    Transacao,
    ContaFinanceira,
    ClienteFinanceiro,

    MacroIndicator,
    Asset,
    Company,
    DailyQuote,
    FinancialStatement,

];
@Module({
    imports: [
        CoreModule,
        TypeOrmModule.forFeature([
            ...FinanceiroEntities,
        ]),
        I11nModule,
        TenantModule,
        ManagerModule,
        CasdastroModule,
        ScheduleModule.forRoot(),
    ],
    exports: [
        LancamentoFinanceiroService,
    ],
    controllers: [
        LancamentoFinanceiroController,
        FaturamentoController,
        IndicatorsController,
        InflationController,
        MacroIndicatorsController,
        FinancialsController,
    ],
    providers: [
        LancamentoFinanceiroService,
        IndicatorsService,
        ScraperService,
        BcbScraperService,
        InflationService,
        MacroIndicatorsService,
        FinancialsService,
    ],
})
export class FinanceiroModule { }
export {
    LancamentoFinanceiro,
    BillingType,
    Transacao,

    Asset,
    Company,
    DailyQuote,
    FinancialStatement,
}