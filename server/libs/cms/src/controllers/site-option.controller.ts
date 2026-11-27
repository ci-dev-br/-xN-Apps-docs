import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SiteOption } from "../models/site-option.entity";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { SiteOptionService } from "../services/site-option.service";

export class SyncPayloadDaoSiteOption extends SyncPayloadDao<SiteOption> {
    @ApiProperty({ type: SiteOption })
    override data?: SiteOption;
}

export class ObterListaSiteOption {
    @ApiProperty({ required: false })
    skip?: number;
    @ApiProperty({ required: false })
    take?: number;
    @ApiProperty({ required: false })
    where?: FindOptionsWhere<SiteOption>[] | FindOptionsWhere<SiteOption>;
    @ApiProperty({ required: false })
    search?: string;
    @ApiProperty({ required: false })
    orderBy?: any;
}

@ApiTags('SiteOption')
@Controller('SiteOption')
export class SiteOptionController extends ControllerDaoBase<SiteOptionService, SiteOption> {
    constructor(service: SiteOptionService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: SiteOption })
    @ApiOperation({ operationId: 'SyncSiteOption' })
    override async Sync(
        @Body() body: SyncPayloadDaoSiteOption,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: SiteOption })
    @ApiOperation({ operationId: 'GetByInternalIdSiteOption' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: SiteOption, isArray: true })
    @ApiOperation({ operationId: 'GetListSiteOption' })
    override async GetList(
        @Body() input: ObterListaSiteOption,
        @Req() req?: any,
    ) {
        return await super.GetList({
            ...input,
            relations: { website: true },
        }, req);
    }

    @Post('Delete')
    @ApiResponse({ type: SiteOption })
    @ApiOperation({ operationId: 'DeleteSiteOption' })
    override async Delete(
        @Body() input: SiteOption,
        @Req() req?: any,
    ) {
        return await super.Delete(input, req);
    }
}
