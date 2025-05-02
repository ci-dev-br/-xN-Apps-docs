import { Module } from "@nestjs/common";
import { Lancamento } from "./model/Lançamento.entity";
import { BillingType } from "./model/billingType.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Category } from "../../cadastro/src/model/category.entity";
import { FaturamentoController } from "./controller/faturamento.controller";
import { Transação } from "./model/Transação";
import { I11nModule } from "@ci/i11n";
import { CasdastroModule } from "@ci/cadastro";
export const FinanceiroEntities = [
    Lancamento,
    BillingType,
    Transação,
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
    Lancamento,
    BillingType,
    Transação,
}