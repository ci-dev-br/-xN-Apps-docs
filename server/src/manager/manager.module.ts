import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Application } from "./model/application.entity";
import { ApplicationController } from "./controller/application.controller";
import { ApplicationService } from "./service/application.service";
export const ManagerEntities = [
    Application,
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

