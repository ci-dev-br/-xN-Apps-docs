import { DynamicModule, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Snapshot, SnapshotService } from "./dao";

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
        TypeOrmModule.forFeature([
            ...CoreEntities,
        ])
    ],
    providers: [

    ],
    exports: [

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
            ]
        }
    }
}