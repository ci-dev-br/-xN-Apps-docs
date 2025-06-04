import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Agendamento } from "../models/agendamento";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { AgendamentoService } from "../service/agendamento.service";
export class SyncPayloadDaoAgendamento extends SyncPayloadDao<Agendamento> {
    @ApiProperty({ type: Agendamento })
    override data?: Agendamento;
}
export class ObterListaAgendamento {
    // override data?: Agendamento;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<Agendamento>[] | FindOptionsWhere<Agendamento>;
}
export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
@ApiTags('Agendamento')
@Controller('Agendamento')
export class AgendamentoController extends ControllerDaoBase<AgendamentoService, Agendamento> {
    constructor(
        service: AgendamentoService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: Agendamento,
    })
    @ApiOperation({
        operationId: 'SyncAgendamento'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoAgendamento,
    ) {
        try {
            return await super.Sync(body)
        } catch (error) {
            return {
                status: 500,
                message: 'Falha',
                detahes: error.message,
                stack: error.stack
            } as any
        }
    }
    @Post('GetList')
    @ApiResponse({
        type: Agendamento, isArray: true
    })
    @ApiOperation({
        operationId: 'GetListAgendamento'
    })
    override async GetList(
        @Body() input: ObterListaAgendamento,
    ) {
        return super.GetList(input);
    }
}