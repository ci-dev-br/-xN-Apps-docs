import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Application } from "./model/application.entity";
import { ApplicationController } from "./controller/application.controller";
import { ApplicationService } from "./service/application.service";
import { Domain } from "./model/domain.entity";
import { Painel } from "./model/painel.entity";
import { Server } from "./model/server.entity";
import { DomainService } from "./service/domain.service";
import { DomainController } from "./controller/domain.controller";
export const ManagerEntities = [
    Application,
    Domain,
    Painel,
    Server,
]
@Module({
    imports: [
        TypeOrmModule.forFeature([
            ...ManagerEntities
        ])
    ],
    controllers: [
        ApplicationController,
        DomainController,
    ],
    providers: [
        ApplicationService,
        DomainService,
    ]
})
export class ManagerModule { }
