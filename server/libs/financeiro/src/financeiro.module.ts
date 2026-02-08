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
export const FinanceiroEntities = [
    LancamentoFinanceiro,
    BillingType,
    Transacao,
    ContaFinanceira,
    ClienteFinanceiro,
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
    ],
    exports: [
        LancamentoFinanceiroService,
    ],
    controllers: [
        LancamentoFinanceiroController,
        FaturamentoController,
    ],
    providers: [
        LancamentoFinanceiroService,
    ],
})
export class FinanceiroModule { }
export {
    LancamentoFinanceiro,
    BillingType,
    Transacao,
}