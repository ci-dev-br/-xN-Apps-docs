import { Module } from "@nestjs/common";
import { Organizacao } from "./model/organizacao.entity";
import { OrganizacaoMembro } from "./model/organizacao-membro.entity";
import { OrganizacaoRole } from "./model/organizacao-role.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CadastroModule } from "@ci/cadastro/cadastro.module";
import { StorageModule } from "@ci/storage/storage.module";
import { TenantModule } from "@ci/tenant/tenant.module";
import { Tenant } from "@ci/tenant/models/tenant.entity";
import { User } from "@ci/auth/models/user.entity";
import { OrganizacaoController } from "./controller/organizacao.controller";
import { AuthModule } from "@ci/auth/auth.module";
import { ManagerModule } from "@ci/manager";
import { Setor } from "./model/setor.entity";
import { CoreModule } from "@ci/core";
import { OrganizacaoService } from "./service/organizacao.service";
export const OrganizacaoEntities = [
    Organizacao,
    Setor,
    OrganizacaoMembro,
    OrganizacaoRole,
];
@Module({
    imports: [
        CoreModule,
        TypeOrmModule.forFeature([
            ...OrganizacaoEntities,
            Tenant,
            User,
        ]),
        ManagerModule,
        CadastroModule,
        StorageModule,
        TenantModule,
        AuthModule,
    ],
    controllers: [
        OrganizacaoController,
    ],
    providers: [
        OrganizacaoService,
    ],
    exports: [
        OrganizacaoService,
    ],
})
export class OrganizacaoModule { }
export {
    Organizacao,
    OrganizacaoMembro,
    OrganizacaoRole,
}
