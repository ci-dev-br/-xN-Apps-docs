import { DynamicModule, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Snapshot, SnapshotService } from "./dao";
// mport { SystemService } from "./system/system.service";

export const CoreEntities = [
    Snapshot,
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
    ],
    exports: [
        SnapshotService,
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