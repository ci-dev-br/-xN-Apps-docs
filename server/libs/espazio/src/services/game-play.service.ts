import { forwardRef, Inject, Injectable, Optional } from "@nestjs/common";
import { EzGamePlay } from "../model/ez-game-play.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { PlayerService } from "./player.service";
import { EventsGateway } from "@ci/core";

@Injectable()
export class GamePlayService {
    private hallList: any[];
    constructor(
        @InjectRepository(EzGamePlay)
        private gameplayrepository: Repository<EzGamePlay>,
        // @Optional()
        @Inject(EventsGateway)
        private events?: EventsGateway,
        // @Optional()
        private playerService?: PlayerService,
    ) { }
    async getGamePlayByUser() {

    }
    async createNewGamePlay() {

    }
    /**
     * Entra em Hall de Jogo 
     * para spolicitação de nova partida.
     *  A função hall localiza jogadores 
     * que querem jogar o mesmo jogo que 
     * você, com as mesmas configuarções.
     * 
     * A plataforma garante recursos avançados
     * de desenvovlimento de jogos que podem ou não
     * ser adotados pelo integrador do jogo. 
     * Qualquer jogo pode ser adaptado para comunicar
     * utlizando a ingra estrutura de EzGamePlay
     * 
     * 
     * @param gameCode 
     * @param options 
     * @returns 
     */
    async hall(
        gameCode: string,
        options: {
            version?: string,
            maxUsers?: number,
            minTimePermanation?: number
            minUsers?: number,
            teams: string[],
            team: string,
        }
    ) {
        const gameplay = await this.gameplayrepository.create();

        if (!this.hallList) this.hallList = [];
        this.hallList.push(options);

        const user_chat = await this.events.createUserChat(options);

        const player = await this.playerService.create(user_chat.__user_identification);

        if (!gameplay.players) gameplay.players = [];

        gameplay.players.push(player);

        await this.gameplayrepository.save(gameplay);

        return user_chat;
    }
}