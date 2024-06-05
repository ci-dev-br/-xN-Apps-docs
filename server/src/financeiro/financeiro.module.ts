import { Module } from "@nestjs/common";
import { Lancamento } from "./model/lancamento.entity";
import { BillingType } from "./model/billingType.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
export const FinanceiroEntities = [
    Lancamento,
    BillingType,
];
@Module({
    imports: [
        TypeOrmModule.forFeature([
            ...FinanceiroEntities,
        ])
    ],
    exports: [],
    controllers: [],
    providers: [],
})
export class FinanceiroModule { }