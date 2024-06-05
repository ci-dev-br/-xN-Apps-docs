import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Prancheta } from "./models/prancheta.entity";
import { PranchetaItemMetadata } from "./models/prancheta-item-metadata.entity";
import { PranchetaController } from "./controller/prancheta.controller";
import { PranchetaService } from "./service/prancheta.service";
import { CoreModule } from "src/core/core.module";
export const PranchetaEntities = [
    Prancheta,
    PranchetaItemMetadata
];
@Module({
    imports: [
        TypeOrmModule.forFeature(PranchetaEntities),
        CoreModule,
    ],
    controllers: [
        PranchetaController,
    ],
    providers: [
        PranchetaService,
    ]
})
export class PranchetaModule { }