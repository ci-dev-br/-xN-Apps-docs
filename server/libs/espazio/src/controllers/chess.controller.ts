import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ChessService } from "../services/chess.service";
import { Move } from "chess.js";
/**
 * Payload para dados da partida
 */
export class GamePayload {
    @ApiProperty({ nullable: true, required: false })
    fen?: string;
    @ApiProperty({ nullable: true, required: false })
    partidaInternalId?: string;
    @ApiProperty({ nullable: true, type: Move, required: false })
    move?: Move;
}
/**
 * Controle para partidas de xadres
 */
@ApiTags('Chess')
@Controller('Chess')
export class ChessController {
    constructor(
        private readonly chessService: ChessService,
    ) { }
    /**
     * Game payload
     * @param payload 
     * @returns 
     */
    @Post('ChessMove')
    @ApiResponse({
        type: GamePayload,
    })
    @ApiOperation({
        operationId: 'ChessMove'
    })
    async move(
        @Body() payload: GamePayload,
    ) {
        payload.move = await this.chessService.getMoveByFen(payload.fen);
        return payload;
    }
}