import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tenant } from "./models/tenant.entity";
import { Grupo } from "./models/grupo.entity";
import { GrupoMembership } from "./models/grupo-membership.entity";
import { GrupoTopico } from "./models/grupo-topico.entity";
import { GrupoTopicoMensagem } from "./models/grupo-topico-mensagem.entity";
import { GrupoAtivoCompartilhado } from "./models/grupo-ativo-compartilhado.entity";
import { User } from "@ci/auth/models/user.entity";
import { TenantService } from "./service/tenant.service";
import { TenantController } from "./controller/tenant.controller";

export const TenantEntities = [
    Tenant,
    Grupo,
    GrupoMembership,
    GrupoTopico,
    GrupoTopicoMensagem,
    GrupoAtivoCompartilhado,
];

/**
 * Módulo Tenant: Gerencia Organizações, Grupos Sociais, Comunidades,
 * Tópicos de discussão e Compartilhamento de Ativos via Tenant.
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([
            ...TenantEntities,
            User,
        ])
    ],
    controllers: [
        TenantController,
    ],
    providers: [
        TenantService,
    ],
    exports: [
        TenantService,
        TypeOrmModule,
    ]
})
export class TenantModule { }