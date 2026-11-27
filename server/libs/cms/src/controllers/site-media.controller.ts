import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { SiteMedia } from "../models/site-media.entity";
import { SiteMediaService } from "../services/site-media.service";

export class SyncPayloadDaoSiteMedia extends SyncPayloadDao<SiteMedia> {
    @ApiProperty({ type: SiteMedia })
    override data?: SiteMedia;
}

export class ObterListaSiteMedia {
    @ApiProperty({ required: false })
    skip?: number;
    @ApiProperty({ required: false })
    take?: number;
    @ApiProperty({ required: false })
    where?: FindOptionsWhere<SiteMedia>[] | FindOptionsWhere<SiteMedia>;
    @ApiProperty({ required: false })
    search?: string;
    @ApiProperty({ required: false })
    orderBy?: any;
}

@ApiTags('SiteMedia')
@Controller('SiteMedia')
export class SiteMediaController extends ControllerDaoBase<SiteMediaService, SiteMedia> {
    constructor(service: SiteMediaService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: SiteMedia })
    @ApiOperation({ operationId: 'SyncSiteMedia' })
    override async Sync(
        @Body() body: SyncPayloadDaoSiteMedia,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: SiteMedia })
    @ApiOperation({ operationId: 'GetByInternalIdSiteMedia' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: SiteMedia, isArray: true })
    @ApiOperation({ operationId: 'GetListSiteMedia' })
    override async GetList(
        @Body() input: ObterListaSiteMedia,
        @Req() req?: any,
    ) {
        return await super.GetList({
            ...input,
            relations: { website: true },
        }, req);
    }

    @Post('Delete')
    @ApiResponse({ type: SiteMedia })
    @ApiOperation({ operationId: 'DeleteSiteMedia' })
    override async Delete(
        @Body() input: SiteMedia,
        @Req() req?: any,
    ) {
        return await super.Delete(input, req);
    }
}
