import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Atendimento } from "../models/atendimento";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { AtendimentoService } from "../service/atendimento.service";

export class SyncPayloadDaoAtendimento extends SyncPayloadDao<Atendimento> {
    @ApiProperty({ type: Atendimento })
    override data?: Atendimento;
}

export class ObterListaAtendimento {
    @ApiProperty({ required: false })
    skip?: number;
    @ApiProperty({ required: false })
    take?: number;
    @ApiProperty({ required: false })
    where?: FindOptionsWhere<Atendimento>[] | FindOptionsWhere<Atendimento>;
}

@ApiTags('Atendimento')
@Controller('Atendimento')
export class AtendimentoController extends ControllerDaoBase<AtendimentoService, Atendimento> {
    constructor(service: AtendimentoService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: Atendimento })
    @ApiOperation({ operationId: 'SyncAtendimento' })
    override async Sync(
        @Body() body: SyncPayloadDaoAtendimento,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: Atendimento })
    @ApiOperation({ operationId: 'GetByInternalIdAtendimento' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: Atendimento, isArray: true })
    @ApiOperation({ operationId: 'GetListAtendimento' })
    override async GetList(
        @Body() input: ObterListaAtendimento,
        @Req() req?: any,
    ) {
        return await super.GetList(input, req);
    }

    @Post('Delete')
    @ApiResponse({ type: Atendimento })
    @ApiOperation({ operationId: 'DeleteAtendimento' })
    override async Delete(
        @Body() body: Atendimento,
        @Req() req?: any,
    ) {
        return await super.Delete(body, req);
    }
}
