import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Application } from "./model/application.entity";
import { ApplicationController } from "./controller/application.controller";
import { ApplicationService } from "./service/application.service";
import { Domain } from "./model/domain.entity";
import { Painel } from "./model/painel.entity";
import { Server } from "./model/server.entity";
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
    ],
    providers: [
        ApplicationService,
    ]
})
export class ManagerModule { }
