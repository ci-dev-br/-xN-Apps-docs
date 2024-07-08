import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Marca } from "./model/marca.entity";
import { Patente } from "./model/patente.entity";
export const INPIEntities = [
    Marca,
    Patente,
]
@Module({
    imports: [
        TypeOrmModule.forFeature([
            ...INPIEntities
        ])
    ],
})
export class INPIModule { }
export {
    Marca,
    Patente,
}