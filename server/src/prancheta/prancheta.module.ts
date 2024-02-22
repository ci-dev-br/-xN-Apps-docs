import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Prancheta } from "./models/prancheta.entity";
import { PranchetaItemMetadata } from "./models/prancheta-item-metadata.entity";
export const PranchetaEntities = [
    Prancheta,
    PranchetaItemMetadata
];
@Module({
    imports: [
        TypeOrmModule.forFeature(PranchetaEntities)
    ]
})
export class PranchetaModule { }