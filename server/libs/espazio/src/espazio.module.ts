import { forwardRef, Module } from "@nestjs/common";
import { ChessController } from "./controllers/chess.controller";
import { ChessService } from "./services/chess.service";
import { CoreModule } from "@ci/core";
import { TenantModule } from "@ci/tenant";
import { EzWorld } from "./model/ez-world.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EzPlayer } from "./model/ez-player.entity";
import { GamePlayService } from "./services/game-play.service";
import { EzGamePlay } from "./model/ez-game-play.entity";
import { PlayerService } from "./services/player.service";
import { GameplayController } from "./controllers/gameplay.controller";
import { EventsGateway } from "@ci/core/events/events.gateway";
import { EzGamePlaySnap } from "./model/ez-game-play-snap.entity";
export const Entities = [
    EzWorld,
    EzPlayer,
    EzGamePlay,
    EzGamePlaySnap,
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
        GameplayController,
    ],
    providers: [
        EventsGateway,
        ChessService,
        GamePlayService,
        PlayerService,
    ]
})
export class EspazioModule { }