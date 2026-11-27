import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ClienteCrm } from "../models/cliente";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { ClienteCrmService } from "../service/cliente-crm.service";

export class SyncPayloadDaoClienteCrm extends SyncPayloadDao<ClienteCrm> {
    @ApiProperty({ type: ClienteCrm })
    override data?: ClienteCrm;
}

export class ObterListaClienteCrm {
    @ApiProperty({ required: false })
    skip?: number;
    @ApiProperty({ required: false })
    take?: number;
    @ApiProperty({ required: false })
    where?: FindOptionsWhere<ClienteCrm>[] | FindOptionsWhere<ClienteCrm>;
}

@ApiTags('ClienteCrm')
@Controller('ClienteCrm')
export class ClienteCrmController extends ControllerDaoBase<ClienteCrmService, ClienteCrm> {
    constructor(service: ClienteCrmService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: ClienteCrm })
    @ApiOperation({ operationId: 'SyncClienteCrm' })
    override async Sync(
        @Body() body: SyncPayloadDaoClienteCrm,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: ClienteCrm })
    @ApiOperation({ operationId: 'GetByInternalIdClienteCrm' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: ClienteCrm, isArray: true })
    @ApiOperation({ operationId: 'GetListClienteCrm' })
    override async GetList(
        @Body() input: ObterListaClienteCrm,
        @Req() req?: any,
    ) {
        return await super.GetList(input, req);
    }

    @Post('Delete')
    @ApiResponse({ type: ClienteCrm })
    @ApiOperation({ operationId: 'DeleteClienteCrm' })
    override async Delete(
        @Body() body: ClienteCrm,
        @Req() req?: any,
    ) {
        return await super.Delete(body, req);
    }
}
