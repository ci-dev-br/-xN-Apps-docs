import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CurrencyCode } from "../../i11n/src/models/currency-code.entity";

export const GlobalizationEntities = [
    CurrencyCode,
];

@Module({
    imports: [
        TypeOrmModule.forFeature(GlobalizationEntities),
    ]
})
export class GlobalizationModule { }
export {
    CurrencyCode,

}