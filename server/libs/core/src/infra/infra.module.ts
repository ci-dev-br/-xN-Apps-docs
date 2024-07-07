import { DynamicModule, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Server } from "./model/server.entity";
import { ServerService } from "./service/server.service";

export const InfraEntities = [
    Server,
]

/**
 * Módulo Core
 *  
 * Snapshot,
 */
@Module({
    imports: [
        TypeOrmModule.forFeature(InfraEntities)
    ],
    providers: [
        ServerService,
    ],
    exports: [
    ]
})
export class InfraModule {
    static forRoot(options: {
        /** 
          Armazena os estados intermediários das entidades Full Audited, permitindo reversão 
         **/
        snapshot: boolean
    }): DynamicModule {
        return {
            module: InfraModule,
            providers: [
            ]
        }
    }
}