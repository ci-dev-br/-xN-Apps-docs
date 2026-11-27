import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Agendamento } from "../models/agendamento";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { AgendamentoService } from "../service/agendamento.service";

export class SyncPayloadDaoAgendamento extends SyncPayloadDao<Agendamento> {
    @ApiProperty({ type: Agendamento })
    override data?: Agendamento;
}

export class ObterListaAgendamento {
    @ApiProperty({ required: false })
    skip?: number;
    @ApiProperty({ required: false })
    take?: number;
    @ApiProperty({ required: false })
    where?: FindOptionsWhere<Agendamento>[] | FindOptionsWhere<Agendamento>;
}

@ApiTags('Agendamento')
@Controller('Agendamento')
export class AgendamentoController extends ControllerDaoBase<AgendamentoService, Agendamento> {
    constructor(service: AgendamentoService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: Agendamento })
    @ApiOperation({ operationId: 'SyncAgendamento' })
    override async Sync(
        @Body() body: SyncPayloadDaoAgendamento,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: Agendamento })
    @ApiOperation({ operationId: 'GetByInternalIdAgendamento' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: Agendamento, isArray: true })
    @ApiOperation({ operationId: 'GetListAgendamento' })
    override async GetList(
        @Body() input: ObterListaAgendamento,
        @Req() req?: any,
    ) {
        return await super.GetList(input, req);
    }

    @Post('Delete')
    @ApiResponse({ type: Agendamento })
    @ApiOperation({ operationId: 'DeleteAgendamento' })
    override async Delete(
        @Body() body: Agendamento,
        @Req() req?: any,
    ) {
        return await super.Delete(body, req);
    }
}
