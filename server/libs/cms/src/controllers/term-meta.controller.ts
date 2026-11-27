import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { TermMeta } from "../models/term-meta.entity";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { TermMetaService } from "../services/term-meta.service";

export class SyncPayloadDaoTermMeta extends SyncPayloadDao<TermMeta> {
    @ApiProperty({ type: TermMeta })
    override data?: TermMeta;
}

export class ObterListaTermMeta {
    @ApiProperty({ required: false })
    skip?: number;
    @ApiProperty({ required: false })
    take?: number;
    @ApiProperty({ required: false })
    where?: FindOptionsWhere<TermMeta>[] | FindOptionsWhere<TermMeta>;
    @ApiProperty({ required: false })
    search?: string;
    @ApiProperty({ required: false })
    orderBy?: any;
}

@ApiTags('TermMeta')
@Controller('TermMeta')
export class TermMetaController extends ControllerDaoBase<TermMetaService, TermMeta> {
    constructor(service: TermMetaService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: TermMeta })
    @ApiOperation({ operationId: 'SyncTermMeta' })
    override async Sync(
        @Body() body: SyncPayloadDaoTermMeta,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: TermMeta })
    @ApiOperation({ operationId: 'GetByInternalIdTermMeta' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: TermMeta, isArray: true })
    @ApiOperation({ operationId: 'GetListTermMeta' })
    override async GetList(
        @Body() input: ObterListaTermMeta,
        @Req() req?: any,
    ) {
        return await super.GetList({
            ...input,
            relations: { term: true },
        }, req);
    }

    @Post('Delete')
    @ApiResponse({ type: TermMeta })
    @ApiOperation({ operationId: 'DeleteTermMeta' })
    override async Delete(
        @Body() input: TermMeta,
        @Req() req?: any,
    ) {
        return await super.Delete(input, req);
    }
}
