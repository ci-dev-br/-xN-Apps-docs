import { Module } from "@nestjs/common";
import { ChessController } from "./controllers/chess.controller";
import { ChessService } from "./services/chess.service";
import { CoreModule } from "@ci/core";
import { TenantModule } from "@ci/tenant";

/**
 * # Espazio module
 * 
 * This module provides the controllers and providers for the Espazio library.
 */
@Module({
    imports: [
        CoreModule,
        TenantModule,
    ],
    controllers: [
        ChessController,
    ],
    providers: [
        ChessService,
    ]
})
export class EspazioModule { }