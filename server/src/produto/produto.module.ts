import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./models/produto.entity";
import { Offer } from "./models/offer.entity";

export const Entities = [
    Product,
    Offer,
];

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ...Entities,
        ])
    ],
    providers: [
    ],
    controllers: [
    ],
})
export class ProdutoModule { }