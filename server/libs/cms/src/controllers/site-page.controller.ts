import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SitePage } from "../models/site-page.entity";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { SitePageService } from "../services/site-page.service";
import { IHaveRequiredToSearch } from "./required-to-search";

export class SyncPayloadDaoSitePage extends SyncPayloadDao<SitePage> {
    @ApiProperty({ type: SitePage })
    override data?: SitePage;
}

export class ObterListaSitePage implements IHaveRequiredToSearch {
    @ApiProperty({
        enum: ['website'],
        required: false,
        nullable: true,
    })
    requiredToSearch?: any;
    @ApiProperty({ required: false })
    skip?: number;
    @ApiProperty({ required: false })
    take?: number;
    @ApiProperty({ required: false })
    where?: FindOptionsWhere<SitePage>[] | FindOptionsWhere<SitePage>;
    @ApiProperty({ required: false })
    search?: string;
    @ApiProperty({ required: false })
    orderBy?: any;
}

@ApiTags('SitePage')
@Controller('SitePage')
export class SitePageController extends ControllerDaoBase<SitePageService, SitePage> {
    constructor(service: SitePageService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: SitePage })
    @ApiOperation({ operationId: 'SyncSitePage' })
    override async Sync(
        @Body() body: SyncPayloadDaoSitePage,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: SitePage })
    @ApiOperation({ operationId: 'GetByInternalIdSitePage' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: SitePage, isArray: true })
    @ApiOperation({ operationId: 'GetListSitePage' })
    override async GetList(
        @Body() input: ObterListaSitePage,
        @Req() req?: any,
    ) {
        return await super.GetList({
            ...input,
            relations: {
                website: true,
            },
        }, req);
    }

    @Post('Delete')
    @ApiResponse({ type: SitePage })
    @ApiOperation({ operationId: 'DeleteSitePage' })
    override async Delete(
        @Body() input: SitePage,
        @Req() req?: any,
    ) {
        return await super.Delete(input, req);
    }
}
