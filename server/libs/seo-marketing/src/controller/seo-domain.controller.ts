import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { SeoDomain } from "../models/seo-domain.entity";
import { SeoDomainService } from "../services/seo-domain.service";

export class SyncPayloadDaoSeoDomain extends SyncPayloadDao<SeoDomain> {
    @ApiProperty({ type: SeoDomain })
    override data?: SeoDomain;
}

export class ObterListaSeoDomain {
    @ApiProperty({ nullable: true, required: false })
    skip?: number;
    @ApiProperty({ nullable: true, required: false })
    take?: number;
    @ApiProperty({ nullable: true, required: false })
    where?: FindOptionsWhere<SeoDomain>[] | FindOptionsWhere<SeoDomain>;
    @ApiProperty({ nullable: true, required: false })
    search?: string;
    @ApiProperty({ nullable: true, required: false })
    orderBy?: any;
    @ApiProperty({ nullable: true, required: false, type: String, isArray: true })
    tenantIds?: string[];
}

@ApiTags('SeoDomain')
@Controller('SeoDomain')
export class SeoDomainController extends ControllerDaoBase<SeoDomainService, SeoDomain> {
    constructor(service: SeoDomainService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: SeoDomain })
    @ApiOperation({ operationId: 'SyncSeoDomain' })
    override async Sync(
        @Body() body: SyncPayloadDaoSeoDomain,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: SeoDomain })
    @ApiOperation({ operationId: 'GetByInternalIdSeoDomain' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: SeoDomain, isArray: true })
    @ApiOperation({ operationId: 'GetListSeoDomain' })
    override async GetList(
        @Body() input: ObterListaSeoDomain,
        @Req() req?: any,
    ) {
        return await super.GetList(input, req);
    }

    @Post('Delete')
    @ApiResponse({ type: SeoDomain })
    @ApiOperation({ operationId: 'DeleteSeoDomain' })
    override async Delete(
        @Body() input: SeoDomain,
        @Req() req?: any,
    ) {
        return await super.Delete(input, req);
    }
}
