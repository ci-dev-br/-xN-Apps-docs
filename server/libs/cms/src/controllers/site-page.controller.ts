import { Body, Controller, Post, Request } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SitePage } from "../models/site-page.entity";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { SitePageService } from "../services/site-page.service";
export class SyncPayloadDaoSitePage extends SyncPayloadDao<SitePage> {
    @ApiProperty({ type: SitePage })
    override data?: SitePage;
}
export class ObterListaSitePage {
    // override data?: SitePage;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<SitePage>[] | FindOptionsWhere<SitePage>;
}
export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
@ApiTags('SitePage')
@Controller('SitePage')
export class SitePageController extends ControllerDaoBase<SitePageService, SitePage> {
    constructor(
        service: SitePageService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: SitePage,
    })
    @ApiOperation({
        operationId: 'SyncSitePage'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoSitePage,
        @Request() req: Request,
    ) {
        try {
            return await super.Sync(body, req);
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
        type: SitePage, isArray: true
    })
    @ApiOperation({
        operationId: 'GetListSitePage'
    })
    override async GetList(
        @Body() input: ObterListaSitePage,
        @Request() req: Request,

    ) {
        return super.GetList(input, req);
    }
    @Post('Delete')
    @ApiResponse({
        type: SitePage
    })
    @ApiOperation({
        operationId: 'DeleteSitePage'
    })
    override async Delete(
        @Body() input: SitePage,
        @Request() req: Request,

    ) {
        return super.Delete(input, req);
    }
}