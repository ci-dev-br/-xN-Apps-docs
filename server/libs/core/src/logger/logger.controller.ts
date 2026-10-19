import { Body, Controller, Get, Param, Post, Request } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { LoggerService } from "./logger.service";
import { Log } from "./log.entity";
import { CreateLogDto, QueryLogDto, TriggerAlertDto, UpdateLogStateDto } from "./dto/log.dto";
import { Role } from "@ci/auth/decorators/role.decorator";

/**
 * Controller de Registro, Consulta e Gerenciamento de Logs
 */
@ApiTags('Logger')
@ApiBearerAuth()
@Controller('Logger')
export class LoggerController {
    constructor(
        private readonly loggerService: LoggerService,
    ) { }

    /**
     * Endpoint acessível para usuários com ROLE MASTER para registro de logs dos sistemas.
     */
    @Role('MASTER')
    @Post('Register')
    @ApiOperation({
        summary: 'Registrar log de sistema (Exclusivo ROLE MASTER)',
        description: 'Registra e cataloga logs de sistemas contendo credenciais de acesso, estado de correção e disparo de alertas.',
        operationId: 'RegisterSystemLog',
    })
    @ApiResponse({
        status: 201,
        type: Log,
        description: 'Log registrado e catalogado com sucesso',
    })
    async register(
        @Body() data: CreateLogDto,
        @Request() req: any,
    ): Promise<Log> {
        return await this.loggerService.register(data, req);
    }

    /**
     * Alias de registro para compatibilidade retroativa
     */
    @Role('MASTER')
    @Post('Registry')
    @ApiOperation({
        summary: 'Registry (Alias)',
        operationId: 'RegistryLog',
    })
    @ApiResponse({
        status: 201,
        type: Log,
    })
    async registry(
        @Body() data: CreateLogDto,
        @Request() req: any,
    ): Promise<Log> {
        return await this.register(data, req);
    }

    /**
     * Consulta avançada de logs catalogados no sistema (Exclusivo ROLE MASTER)
     */
    @Role('MASTER')
    @Post('Query')
    @ApiOperation({
        summary: 'Consultar logs catalogados (Exclusivo ROLE MASTER)',
        description: 'Filtra logs por nível, origem, aplicação, estado de correção, disparo de alertas e credenciais.',
        operationId: 'QueryLogs',
    })
    async query(
        @Body() query: QueryLogDto,
    ) {
        return await this.loggerService.query(query);
    }

    /**
     * Consulta log específico por seu identificador (Exclusivo ROLE MASTER)
     */
    @Role('MASTER')
    @Get(':id')
    @ApiOperation({
        summary: 'Obter detalhes do log por ID (Exclusivo ROLE MASTER)',
        operationId: 'GetLogById',
    })
    @ApiResponse({
        type: Log,
    })
    async getById(
        @Param('id') id: string,
    ): Promise<Log> {
        return await this.loggerService.getById(id);
    }

    /**
     * Atualização do estado do log: se deve ser corrigido ou não, status e disparo de alertas (Exclusivo ROLE MASTER)
     */
    @Role('MASTER')
    @Post('UpdateState')
    @ApiOperation({
        summary: 'Atualizar estado do log (Exclusivo ROLE MASTER)',
        description: 'Define se o log deve ser corrigido, altera o status de tratamento e controla o disparo de alertas.',
        operationId: 'UpdateLogState',
    })
    @ApiResponse({
        type: Log,
    })
    async updateState(
        @Body() dto: UpdateLogStateDto,
    ): Promise<Log> {
        return await this.loggerService.updateState(dto);
    }

    /**
     * Disparo manual de alerta para um log catalogado (Exclusivo ROLE MASTER)
     */
    @Role('MASTER')
    @Post('TriggerAlert')
    @ApiOperation({
        summary: 'Disparar alerta para log (Exclusivo ROLE MASTER)',
        description: 'Força o disparo de alerta para o log especificado informando os canais e o motivo.',
        operationId: 'TriggerLogAlert',
    })
    @ApiResponse({
        type: Log,
    })
    async triggerAlert(
        @Body() alertDto: TriggerAlertDto,
    ): Promise<Log> {
        return await this.loggerService.triggerAlert(alertDto.internalId, alertDto);
    }

    /**
     * Registro de múltiplos logs em lote (Exclusivo ROLE MASTER)
     */
    @Role('MASTER')
    @Post('Batch')
    @ApiOperation({
        summary: 'Registrar lote de logs de sistemas (Exclusivo ROLE MASTER)',
        operationId: 'RegisterBatchLogs',
    })
    async registerBatch(
        @Body() items: CreateLogDto[],
        @Request() req: any,
    ): Promise<Log[]> {
        const results: Log[] = [];
        for (const item of items) {
            results.push(await this.loggerService.register(item, req));
        }
        return results;
    }

    /**
     * Ingestão / consumo de logs do cliente (Angular, Web, Mobile)
     * Captura automaticamente as credenciais de acesso do usuário logado se presentes no token da requisição.
     */
    @Post('Client')
    @ApiOperation({
        summary: 'Consumo de logs do cliente',
        description: 'Recebe logs enviados pelo cliente, associando automaticamente às credenciais de acesso do usuário.',
        operationId: 'IngestClientLog',
    })
    @ApiResponse({
        status: 201,
        type: Log,
    })
    async ingestClientLog(
        @Body() data: CreateLogDto,
        @Request() req: any,
    ): Promise<Log> {
        return await this.loggerService.registerClientLog(data, req);
    }
}