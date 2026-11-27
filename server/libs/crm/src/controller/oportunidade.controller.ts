import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { Oportunidade } from "../models/oportunidade";
import { OportunidadeService } from "../service/oportunidade.service";

export class SyncPayloadDaoOportunidade extends SyncPayloadDao<Oportunidade> {
    @ApiProperty({ type: Oportunidade })
    override data?: Oportunidade;
}

export class ObterListaOportunidade {
    @ApiProperty({ required: false })
    skip?: number;
    @ApiProperty({ required: false })
    take?: number;
    @ApiProperty({ required: false })
    where?: FindOptionsWhere<Oportunidade>[] | FindOptionsWhere<Oportunidade>;
    @ApiProperty({ required: false })
    search?: string;
    @ApiProperty({ required: false })
    orderBy?: any;
}

@ApiTags('Oportunidade')
@Controller('Oportunidade')
export class OportunidadeController extends ControllerDaoBase<OportunidadeService, Oportunidade> {
    constructor(service: OportunidadeService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: Oportunidade })
    @ApiOperation({ operationId: 'SyncOportunidade' })
    override async Sync(
        @Body() body: SyncPayloadDaoOportunidade,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: Oportunidade })
    @ApiOperation({ operationId: 'GetByInternalIdOportunidade' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: Oportunidade, isArray: true })
    @ApiOperation({ operationId: 'GetListOportunidade' })
    override async GetList(
        @Body() input: ObterListaOportunidade,
        @Req() req?: any,
    ) {
        return await super.GetList(input, req);
    }

    @Post('Delete')
    @ApiResponse({ type: Oportunidade })
    @ApiOperation({ operationId: 'DeleteOportunidade' })
    override async Delete(
        @Body() body: Oportunidade,
        @Req() req?: any,
    ) {
        return await super.Delete(body, req);
    }
}
