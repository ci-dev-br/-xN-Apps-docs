import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { AtividadeCrm } from "../models/atividade-crm";
import { AtividadeCrmService } from "../service/atividade-crm.service";

export class SyncPayloadDaoAtividadeCrm extends SyncPayloadDao<AtividadeCrm> {
    @ApiProperty({ type: AtividadeCrm })
    override data?: AtividadeCrm;
}

export class ObterListaAtividadeCrm {
    @ApiProperty({ required: false })
    skip?: number;
    @ApiProperty({ required: false })
    take?: number;
    @ApiProperty({ required: false })
    where?: FindOptionsWhere<AtividadeCrm>[] | FindOptionsWhere<AtividadeCrm>;
    @ApiProperty({ required: false })
    search?: string;
    @ApiProperty({ required: false })
    orderBy?: any;
}

@ApiTags('AtividadeCrm')
@Controller('AtividadeCrm')
export class AtividadeCrmController extends ControllerDaoBase<AtividadeCrmService, AtividadeCrm> {
    constructor(service: AtividadeCrmService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: AtividadeCrm })
    @ApiOperation({ operationId: 'SyncAtividadeCrm' })
    override async Sync(
        @Body() body: SyncPayloadDaoAtividadeCrm,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: AtividadeCrm })
    @ApiOperation({ operationId: 'GetByInternalIdAtividadeCrm' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: AtividadeCrm, isArray: true })
    @ApiOperation({ operationId: 'GetListAtividadeCrm' })
    override async GetList(
        @Body() input: ObterListaAtividadeCrm,
        @Req() req?: any,
    ) {
        return await super.GetList(input, req);
    }

    @Post('Delete')
    @ApiResponse({ type: AtividadeCrm })
    @ApiOperation({ operationId: 'DeleteAtividadeCrm' })
    override async Delete(
        @Body() body: AtividadeCrm,
        @Req() req?: any,
    ) {
        return await super.Delete(body, req);
    }
}
