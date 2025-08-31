import { DynamicModule, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Snapshot, SnapshotService } from "../../manager/src/dao";
import { AudtService } from "./audt/audt.service";
import { Credential } from "./audt/credential.entity";
import { DamnService } from "./damn/damn.service";
import { EventsGateway } from "./events/events.gateway";
// import { EventsLocalGateway } from "./events/events-local.gateway";
import { BusService } from "./events/bus.service";
import { EventsLocalGateway } from "./events/events-local.gateway";
import { Log } from "./logger/log.entity";
// import { t } from "./i18n/t";
// import { IAutentication } from "./auth/auth";
// import { Status } from "./system/model/status";
// mport { SystemService } from "./system/system.service";
export const CoreEntities = [
    Snapshot,
    Credential,
    Log,
]
/**
 * Módulo Core
 *  
 * Snapshot,
 */
@Module({
    imports: [
        TypeOrmModule.forFeature(CoreEntities)
    ],
    providers: [
        SnapshotService,
        AudtService,
        BusService,
    ],
    exports: [
        SnapshotService,
        AudtService,
        BusService,
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
            providers: [
                SnapshotService,
                DamnService,
                EventsGateway,
                EventsLocalGateway,
                BusService,
                // SystemService,
            ]
        }
    }
}