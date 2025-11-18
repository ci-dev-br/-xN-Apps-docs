import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Marca } from "./model/marca.entity";
import { Patente } from "./model/patente.entity";
import { ClienteINPI } from "./model/cliente-inpi.entity";
import { PrazoINPI } from "./model/prazo-inpi.entity";
import { ProcessoINPI } from "./model/process-inpi.entity";
import { AtivoIntelectual } from "./model/ativo-intelectual.entity";
export const INPIEntities = [
    Marca,
    Patente,
    ClienteINPI,
    PrazoINPI,
    ProcessoINPI,
    AtivoIntelectual,
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
    ClienteINPI,
    PrazoINPI,
    ProcessoINPI,
    AtivoIntelectual,
}