import { Module } from "@nestjs/common";
import { Localization } from "./localization.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CoreModule } from "../core.module";
export const L10nEntities = [
    Localization,
];
/**
 * Módulos externos necessários para o comportamento padrão do módulo
 */
const EXRTERNAL_MODULES = [
    CoreModule
];
@Module({
    imports: [
        ...EXRTERNAL_MODULES,
        TypeOrmModule.forFeature(L10nEntities)
    ],
    providers: [
        
    ]
})
export class L10nModule { }