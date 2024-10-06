import { Module } from "@nestjs/common";
import { Lancamento } from "./model/Lançamento.entity";
import { BillingType } from "./model/billingType.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Category } from "./model/category.entity";
import { FaturamentoController } from "./controller/faturamento.controller";
export const FinanceiroEntities = [
    Lancamento,
    BillingType,
    Category,
];
@Module({
    imports: [
        TypeOrmModule.forFeature([
            ...FinanceiroEntities,
        ])
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
    Category,
}