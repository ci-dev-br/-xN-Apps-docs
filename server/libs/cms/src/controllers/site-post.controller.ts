import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SitePost } from "../models/site-post.entity";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { SitePostService } from "../services/site-post.service";

export class SyncPayloadDaoSitePost extends SyncPayloadDao<SitePost> {
    @ApiProperty({ type: SitePost })
    override data?: SitePost;
}

export class ObterListaSitePost {
    @ApiProperty({ required: false })
    skip?: number;
    @ApiProperty({ required: false })
    take?: number;
    @ApiProperty({ required: false })
    where?: FindOptionsWhere<SitePost>[] | FindOptionsWhere<SitePost>;
    @ApiProperty({ required: false })
    search?: string;
    @ApiProperty({ required: false })
    orderBy?: any;
}

@ApiTags('SitePost')
@Controller('SitePost')
export class SitePostController extends ControllerDaoBase<SitePostService, SitePost> {
    constructor(service: SitePostService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: SitePost })
    @ApiOperation({ operationId: 'SyncSitePost' })
    override async Sync(
        @Body() body: SyncPayloadDaoSitePost,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: SitePost })
    @ApiOperation({ operationId: 'GetByInternalIdSitePost' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: SitePost, isArray: true })
    @ApiOperation({ operationId: 'GetListSitePost' })
    override async GetList(
        @Body() input: ObterListaSitePost,
        @Req() req?: any,
    ) {
        return await super.GetList({
            ...input,
            relations: {
                website: true,
                terms: true,
            },
        }, req);
    }

    @Post('Delete')
    @ApiResponse({ type: SitePost })
    @ApiOperation({ operationId: 'DeleteSitePost' })
    override async Delete(
        @Body() input: SitePost,
        @Req() req?: any,
    ) {
        return await super.Delete(input, req);
    }
}
