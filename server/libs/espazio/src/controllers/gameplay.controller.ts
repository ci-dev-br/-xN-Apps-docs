import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { GamePlayService } from "../services/game-play.service";

@Controller('Gameplay')
@ApiTags('Gameplay')
export class GameplayController {
    constructor(
        private gameplay: GamePlayService,
    ) { }

}