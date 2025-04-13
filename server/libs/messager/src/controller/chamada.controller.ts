import { Controller, Post } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { ChamadaService } from "../service/chamada.service";
/**
 * Atendimento API
 * 
 * 
 */
@ApiTags('Chamada')
@Controller('Chamada')
export class ChamadaController {
    constructor(
        private readonly atendimentoService: ChamadaService,
    ) { }
    @ApiResponse({ description: 'NovaChamada' })
    @Post('NovaChamada')
    async NovaChamada() {
        return await this.atendimentoService.IniciarChamada();
    }
}