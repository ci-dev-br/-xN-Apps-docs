import { DynamicModule, forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Application } from "./model/application.entity";
import { ApplicationController } from "./controller/application.controller";
import { ApplicationService } from "./service/application.service";
import { Domain } from "./model/domain.entity";
import { Painel } from "./model/painel.entity";
import { ApplicationServer } from "./model/application-server.entity";
import { ClientVersionCatalog } from "./model/client-version-catalog.entity";
import { ApplicationConsumption } from "./model/application-consumption.entity";
import { DeveloperGratitude } from "./model/developer-gratitude.entity";
import { DeveloperGratitudeConfig } from "./model/developer-gratitude-config.entity";
import { DomainService } from "./service/domain.service";
import { DomainController } from "./controller/domain.controller";
import { CoreModule } from "@ci/core";
import { ServerController } from "./controller";
import { DinamycPageView } from "./model/dinamic-page-view.entity";
import { DNSService } from "./service/dns.service";
import { ManagerDeployOption } from "./model/deploy-option.entity";
import { User } from "@ci/auth/models/user.entity";
import { FinanceiroModule } from "@ci/financeiro";

export const ManagerEntities = [
    Application,
    Domain,
    Painel,
    ApplicationServer,
    DinamycPageView,
    ManagerDeployOption,
    ClientVersionCatalog,
    ApplicationConsumption,
    DeveloperGratitude,
    DeveloperGratitudeConfig,
];

export class IOptionApplication {
    icon?: string;
    title?: string;
    description?: string;
    roles?: string[];
}
export class IOptionsApplicationFeatures {
    application?: IOptionApplication;
}

@Module({
    imports: [
        forwardRef(() => CoreModule),
        forwardRef(() => FinanceiroModule),
        TypeOrmModule.forFeature([
            ...ManagerEntities,
            User,
        ]),
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
    ],
    exports: [
        ApplicationService,
        DomainService,
    ]
})
export class ManagerModule {
    static forApplication(options: IOptionsApplicationFeatures): DynamicModule {
        return {
            module: ManagerModule,
            providers: [
                {
                    provide: 'APPLICATION_OPTIONS',
                    useValue: options
                }
            ]
        }
    }
}
