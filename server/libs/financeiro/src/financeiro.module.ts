import { Module } from "@nestjs/common";
import { LancamentoFinanceiro } from "./model/lancamento.entity";
import { BillingType } from "./model/billing-type.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Category } from "../../cadastro/src/model/category.entity";
import { FaturamentoController } from "./controller/faturamento.controller";
import { Transacao } from "./model/transacao.entity";
import { I11nModule } from "@ci/i11n";
import { CasdastroModule } from "@ci/cadastro";
import { ContaFinanceira } from "./model/conta-financeira.entity";
export const FinanceiroEntities = [
    LancamentoFinanceiro,
    BillingType,
    Transacao,
    ContaFinanceira,
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