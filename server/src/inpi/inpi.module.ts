import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Marca } from "./model/marca.entity";
export const INPIEntities = [
    Marca,
]
@Module({
    imports: [
        TypeOrmModule.forFeature([
            ...INPIEntities
        ])
    ],
})
export class INPIModule { }