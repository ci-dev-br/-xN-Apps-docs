import { Module } from "@nestjs/common";
import { ChessController } from "./controllers/chess.controller";
import { ChessService } from "./services/chess.service";
import { CoreModule } from "@ci/core";
import { TenantModule } from "@ci/tenant";
import { EzWorld } from "./model/ez-world.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EzPlayer } from "./model/ez-player.entity";
import { GamePlaySevice } from "./services/game-play.service";
import { EzGamePlay } from "./model/ez-game-play.entity";
export const Entities = [
    EzWorld,
    EzPlayer,
    EzGamePlay,
];
/**
 * # Espazio module
 * 
 * This module provides the controllers and providers for the Espazio library.
 */
@Module({
    imports: [
        CoreModule,
        TenantModule,
        TypeOrmModule.forFeature(Entities),
    ],
    controllers: [
        ChessController,
    ],
    providers: [
        ChessService,
        GamePlaySevice,
    ]
})
export class EspazioModule { }