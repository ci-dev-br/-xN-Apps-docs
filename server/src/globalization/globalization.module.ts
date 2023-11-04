import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Currency } from "./models/currency.entity";

export const GlobalizationEntities = [
    Currency,
];

@Module({
    imports: [
        TypeOrmModule.forFeature(GlobalizationEntities),
    ]
})
export class GlobalizationModule { }