import { DynamicModule, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Snapshot, SnapshotService } from "../../manager/src/dao/entities";
import { AudtService } from "./audt/audt.service";
import { Credential } from "./audt/credential.entity";
import { DamnService } from "./damn/damn.service";
import { EventsGateway } from "./events/events.gateway";
import { BusService } from "./events/bus.service";
import { EventsLocalGateway } from "./events/events-local.gateway";
import { Log } from "./logger/log.entity";
import { CredentialAccess } from "./audt/credential-access.entity";
import { AssistantService } from "./ai/assistant.service";
import { LoggerModule } from "./logger/logger.module";
import { LoggerService } from "./logger/logger.service";
import { LoggerController } from "./logger/logger.controller";

export const CoreEntities = [
    Snapshot,
    Credential,
    Log,
    CredentialAccess,
];

const OrmModule = TypeOrmModule.forFeature(CoreEntities);

/**
 * Módulo Core
 */
@Module({
    imports: [
        OrmModule,
        LoggerModule,
    ],
    providers: [
        SnapshotService,
        AudtService,
        BusService,
        AssistantService,
        LoggerService,
    ],
    controllers: [
        LoggerController,
    ],
    exports: [
        SnapshotService,
        AudtService,
        BusService,
        AssistantService,
        OrmModule,
        LoggerModule,
        LoggerService,
    ]
})
export class CoreModule {
    static forRoot(options: {
        /** 
          Armazena os estados intermediários das entidades Full Audited, permitindo reversão 
         **/
        snapshot: boolean
    }): DynamicModule {
        return {
            module: CoreModule,
            imports: [
                LoggerModule,
            ],
            controllers: [
                LoggerController,
            ],
            providers: [
                SnapshotService,
                DamnService,
                EventsGateway,
                EventsLocalGateway,
                BusService,
                LoggerService,
            ],
            exports: [
                LoggerModule,
                LoggerService,
            ]
        };
    }
}