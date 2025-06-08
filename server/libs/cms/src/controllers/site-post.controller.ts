import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SitePost } from "../models/site-post.entity";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { SitePostService } from "../services/site-post.service";
export class SyncPayloadDaoSitePost extends SyncPayloadDao<SitePost> {
    @ApiProperty({ type: SitePost })
    override data?: SitePost;
}
export class ObterListaSitePost {
    // override data?: SitePost;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<SitePost>[] | FindOptionsWhere<SitePost>;
}
export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
@ApiTags('SitePost')
@Controller('SitePost')
export class SitePostController extends ControllerDaoBase<SitePostService, SitePost> {
    constructor(
        service: SitePostService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: SitePost,
    })
    @ApiOperation({
        operationId: 'SyncSitePost'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoSitePost,
    ) {
        try {
            return await super.Sync(body)
        } catch (error) {
            return {
                status: 500,
                message: 'Falha',
                detahes: error.message,
                stack: error.stack
            } as any
        }
    }
    @Post('GetList')
    @ApiResponse({
        type: SitePost, isArray: true
    })
    @ApiOperation({
        operationId: 'GetListSitePost'
    })
    override async GetList(
        @Body() input: ObterListaSitePost,
    ) {
        return super.GetList(input);
    }
}