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
export const FinanceiroEntities = [
    LancamentoFinanceiro,
    BillingType,
    Transacao,
    ContaFinanceira,
    ClienteFinanceiro,
];
@Module({
    imports: [
        TypeOrmModule.forFeature([
            ...FinanceiroEntities,
        ]),
        I11nModule,
        CasdastroModule,

    ],
    exports: [],
    controllers: [
        FaturamentoController,
    ],
    providers: [
    ],
})
export class FinanceiroModule { }
export {
    LancamentoFinanceiro as Lancamento,
    BillingType,
    Transacao as Transação,
}