import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tenant } from "./models/tenant.entity";
export const TenantEntities = [
    Tenant,
]
/**
 * Módulos de inquilinos permitem com que uma instalação supra recursos para outra instalação por meio do Serviço de Inquilinos que permite executar processos. 
 */
@Module({
    imports: [
        TypeOrmModule.forFeature(TenantEntities)
    ]
})
export class TenantModule { }