import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Application } from "./model/application.entity";
import { ApplicationController } from "./controller/application.controller";
import { ApplicationService } from "./service/application.service";
import { Domain } from "./model/domain.entity";
import { Painel } from "./model/painel.entity";
import { ApplicationServer } from "./model/application-server.entity";
import { DomainService } from "./service/domain.service";
import { DomainController } from "./controller/domain.controller";
import { CoreModule } from "@ci/core";
import { ServerController } from "./controller";
import { DinamycPageView } from "./model/page.entity";
import { DNSService } from "./service/dns.service";
export const ManagerEntities = [
    Application,
    Domain,
    Painel,
    ApplicationServer,
    DinamycPageView,
]
@Module({
    imports: [
        forwardRef(() => CoreModule),
        TypeOrmModule.forFeature([
            ...ManagerEntities
        ])
    ],
    controllers: [
        ApplicationController,
        DomainController,
        ServerController,
    ],
    providers: [
        ApplicationService,
        DomainService,
        DNSService,
    ]
})
export class ManagerModule { }
