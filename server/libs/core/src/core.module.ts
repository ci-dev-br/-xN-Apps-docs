import { DynamicModule, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Snapshot, SnapshotService } from "../../manager/src/dao";
import { AudtService } from "./audt/audt.service";
import { ChaveAcesso } from "./audt/chave-acesso.entity";
// import { t } from "./i18n/t";
// import { IAutentication } from "./auth/auth";
// import { Status } from "./system/model/status";
// mport { SystemService } from "./system/system.service";

export const CoreEntities = [
    Snapshot,
    ChaveAcesso,
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
    ],
    exports: [
        SnapshotService,
        AudtService,
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
                // SystemService,
            ]
        }
    }
}