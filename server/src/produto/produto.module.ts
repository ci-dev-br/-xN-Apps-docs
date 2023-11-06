import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./models/produto.entity";
import { Offer } from "./models/offer.entity";
import { TenantModule } from "src/tenant/tenant.module";

export const ProcutEntities = [
    Product,
    Offer,
];

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ...ProcutEntities,
        ]),
        TenantModule,
    ],
    providers: [
    ],
    controllers: [
    ],
})
export class ProdutoModule { }