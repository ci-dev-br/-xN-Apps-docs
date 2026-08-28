import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotaFiscalService } from '../services/nota-fiscal.service';
import { CreateNotaFiscalDto } from '../dto/create-nota-fiscal.dto';

@ApiTags('Notas Fiscais')
@Controller('notas-fiscais')
export class NotaFiscalController {
    constructor(private readonly notaFiscalService: NotaFiscalService) { }

    @Post('emitir')
    @ApiOperation({ summary: 'Emite uma nova Nota Fiscal para SEFAZ/Curitiba' })
    @ApiResponse({ status: 201, description: 'Nota fiscal processada com sucesso.' })
    @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
    async emitir(@Body() createNotaFiscalDto: CreateNotaFiscalDto) {
        return this.notaFiscalService.emitir(createNotaFiscalDto);
    }
}