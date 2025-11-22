import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Marca } from "./model/marca.entity";
import { Patente } from "./model/patente.entity";
import { ClienteINPI } from "./model/cliente-inpi.entity";
import { PrazoINPI } from "./model/prazo-inpi.entity";
import { ProcessoINPI } from "./model/process-inpi.entity";
import { AtivoIntelectual } from "./model/ativo-intelectual.entity";
import { ManagerModule } from "@ci/manager";
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
        ]),
        ManagerModule.forApplication({
            application: {
                icon: '/icons/apps/inpi.svg',
                title: 'INPI',
                description: 'Marcas e Patentes',
                rules: [
                    'ADMIN'
                ]
            }
        }),
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