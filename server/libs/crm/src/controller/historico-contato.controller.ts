import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { HistoricoContato } from "../models/historico-contato";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { HistoricoContatoService } from "../service/historico-contato.service";

export class SyncPayloadDaoHistoricoContato extends SyncPayloadDao<HistoricoContato> {
    @ApiProperty({ type: HistoricoContato })
    override data?: HistoricoContato;
}

export class ObterListaHistoricoContato {
    @ApiProperty({ required: false })
    skip?: number;
    @ApiProperty({ required: false })
    take?: number;
    @ApiProperty({ required: false })
    where?: FindOptionsWhere<HistoricoContato>[] | FindOptionsWhere<HistoricoContato>;
}

@ApiTags('HistoricoContato')
@Controller('HistoricoContato')
export class HistoricoContatoController extends ControllerDaoBase<HistoricoContatoService, HistoricoContato> {
    constructor(service: HistoricoContatoService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: HistoricoContato })
    @ApiOperation({ operationId: 'SyncHistoricoContato' })
    override async Sync(
        @Body() body: SyncPayloadDaoHistoricoContato,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: HistoricoContato })
    @ApiOperation({ operationId: 'GetByInternalIdHistoricoContato' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: HistoricoContato, isArray: true })
    @ApiOperation({ operationId: 'GetListHistoricoContato' })
    override async GetList(
        @Body() input: ObterListaHistoricoContato,
        @Req() req?: any,
    ) {
        return await super.GetList(input, req);
    }

    @Post('Delete')
    @ApiResponse({ type: HistoricoContato })
    @ApiOperation({ operationId: 'DeleteHistoricoContato' })
    override async Delete(
        @Body() body: HistoricoContato,
        @Req() req?: any,
    ) {
        return await super.Delete(body, req);
    }
}
