import { Body, Controller, Res } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiTags } from "@nestjs/swagger";
import { PlayerService } from "../services/player.service";

@ApiTags('EzPlayer')
@Controller('EzPlayer')
export class EzPlayerController {
    constructor(
        private readonly playerservice: PlayerService,
    ) { }
    @ApiOperation({ operationId: 'EzPlayerStartOn' })
    @ApiTags('StartOn')
    async start(
        @Res() req: any,
        @Body() payload: any,
    ) {
        const nome = await this.playerservice.create(payload.nickname);
    }
}