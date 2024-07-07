import { Module } from "@nestjs/common";
import { Organizacao } from "./model/organizacao.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CasdastroModule } from "@ci/cadastro/cadastro.module";
import { StorageModule } from "src/storage/storage.module";
import { TenantModule } from "@ci/tenant/tenant.module";
import { OrganizacaoController } from "./controller/organizacao.controller";
import { OrganizacaoService } from "./service/organizacao.service";
import { AuthModule } from "@ci/auth/auth.module";

export const OrganizacaoEntities = [
    Organizacao,
];

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ...OrganizacaoEntities
        ]),
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