import { Module } from "@nestjs/common";
import { Organizacao } from "./model/organizacao.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CasdastroModule } from "@ci/cadastro/cadastro.module";
import { StorageModule } from "@ci/storage/storage.module";
import { TenantModule } from "@ci/tenant/tenant.module";
import { OrganizacaoController } from "./controller/organizacao.controller";
import { AuthModule } from "@ci/auth/auth.module";
import { ManagerModule } from "@ci/manager";
import { Setor } from "./model/setor.entity";
import { CoreModule } from "@ci/core";
import { OrganizacaoService } from "./service/Organizacao.service";
export const OrganizacaoEntities = [
    Organizacao,
    Setor,
];
@Module({
    imports: [
        CoreModule,
        TypeOrmModule.forFeature([
            ...OrganizacaoEntities
        ]),
        ManagerModule,
        CasdastroModule,
        StorageModule,
        TenantModule,
        AuthModule,
    ],
    controllers: [
        OrganizacaoController,
    ],
    providers: [
        OrganizacaoService,
    ]
})
export class OrganizacaoModule { }
export {
    Organizacao,
}