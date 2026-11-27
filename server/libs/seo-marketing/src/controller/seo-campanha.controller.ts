import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { SeoCampanha } from "../models/seo-campanha.entity";
import { SeoCampanhaService } from "../services/seo-campanha.service";

export class SyncPayloadDaoSeoCampanha extends SyncPayloadDao<SeoCampanha> {
    @ApiProperty({ type: SeoCampanha })
    override data?: SeoCampanha;
}

export class ObterListaSeoCampanha {
    @ApiProperty({ nullable: true, required: false })
    skip?: number;
    @ApiProperty({ nullable: true, required: false })
    take?: number;
    @ApiProperty({ nullable: true, required: false })
    where?: FindOptionsWhere<SeoCampanha>[] | FindOptionsWhere<SeoCampanha>;
    @ApiProperty({ nullable: true, required: false })
    search?: string;
    @ApiProperty({ nullable: true, required: false })
    orderBy?: any;
    @ApiProperty({ nullable: true, required: false, type: String, isArray: true })
    tenantIds?: string[];
}

@ApiTags('SeoCampanha')
@Controller('SeoCampanha')
export class SeoCampanhaController extends ControllerDaoBase<SeoCampanhaService, SeoCampanha> {
    constructor(service: SeoCampanhaService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: SeoCampanha })
    @ApiOperation({ operationId: 'SyncSeoCampanha' })
    override async Sync(
        @Body() body: SyncPayloadDaoSeoCampanha,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: SeoCampanha })
    @ApiOperation({ operationId: 'GetByInternalIdSeoCampanha' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: SeoCampanha, isArray: true })
    @ApiOperation({ operationId: 'GetListSeoCampanha' })
    override async GetList(
        @Body() input: ObterListaSeoCampanha,
        @Req() req?: any,
    ) {
        return await super.GetList({
            ...input,
            relations: {
                dominio: true,
            },
        }, req);
    }

    @Post('Delete')
    @ApiResponse({ type: SeoCampanha })
    @ApiOperation({ operationId: 'DeleteSeoCampanha' })
    override async Delete(
        @Body() input: SeoCampanha,
        @Req() req?: any,
    ) {
        return await super.Delete(input, req);
    }
}
