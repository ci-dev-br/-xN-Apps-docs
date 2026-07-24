import { Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { GamePlayService } from "../services/game-play.service";
import { response } from "@ci/core";
@Controller('Gameplay')
@ApiTags('Gameplay')
export class GameplayController {
    constructor(
        private gameplay: GamePlayService,
    ) { }
    @Post('CreateNewGameplay')
    @ApiOperation({
        operationId: 'CreateNewGameplay'
    })
    async CreateNewGameplay(
        @Req() req: any,
    ) {
        return await response(() => this.gameplay.createNewGamePlay(req));
    }
    @Post('GetGamePlayByUser')
    @ApiOperation({
        operationId: 'getGamePlayByUser'
    })
    async getGamePlayByUser(
        @Req() req: any,
    ) {
        return await response(async () => await this.gameplay.getGamePlayOrCreate(req), req);
    }
}