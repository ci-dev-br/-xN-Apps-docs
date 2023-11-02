import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Application } from "./model/application.entity";
import { ApplicationController } from "./controller/application.controller";
import { ApplicationService } from "./service/application.service";
import { Domain } from "./model/domain.entity";
export const ManagerEntities = [
    Application,
    Domain,
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
