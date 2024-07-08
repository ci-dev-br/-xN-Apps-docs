import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tenant } from "./models/tenant.entity";

export const TenantEntities = [
    Tenant,
]

@Module({
    imports: [
        TypeOrmModule.forFeature(TenantEntities)
    ]
})
export class TenantModule { }