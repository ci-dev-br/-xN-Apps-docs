import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Produto } from "./models/produto.entity";

export const Entities = [
    Produto
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