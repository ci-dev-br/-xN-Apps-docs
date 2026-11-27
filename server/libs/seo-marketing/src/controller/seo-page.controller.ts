import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { SeoPage } from "../models/seo-page.entity";
import { SeoPageService } from "../services/seo-page.service";

export class SyncPayloadDaoSeoPage extends SyncPayloadDao<SeoPage> {
    @ApiProperty({ type: SeoPage })
    override data?: SeoPage;
}

export class ObterListaSeoPage {
    @ApiProperty({ nullable: true, required: false })
    skip?: number;
    @ApiProperty({ nullable: true, required: false })
    take?: number;
    @ApiProperty({ nullable: true, required: false })
    where?: FindOptionsWhere<SeoPage>[] | FindOptionsWhere<SeoPage>;
    @ApiProperty({ nullable: true, required: false })
    search?: string;
    @ApiProperty({ nullable: true, required: false })
    orderBy?: any;
    @ApiProperty({ nullable: true, required: false, type: String, isArray: true })
    tenantIds?: string[];
}

@ApiTags('SeoPage')
@Controller('SeoPage')
export class SeoPageController extends ControllerDaoBase<SeoPageService, SeoPage> {
    constructor(service: SeoPageService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: SeoPage })
    @ApiOperation({ operationId: 'SyncSeoPage' })
    override async Sync(
        @Body() body: SyncPayloadDaoSeoPage,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: SeoPage })
    @ApiOperation({ operationId: 'GetByInternalIdSeoPage' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: SeoPage, isArray: true })
    @ApiOperation({ operationId: 'GetListSeoPage' })
    override async GetList(
        @Body() input: ObterListaSeoPage,
        @Req() req?: any,
    ) {
        return await super.GetList({
            ...input,
            relations: {
                dominio: true,
                campanha: true,
                palavrasChave: true,
            },
        }, req);
    }

    @Post('Delete')
    @ApiResponse({ type: SeoPage })
    @ApiOperation({ operationId: 'DeleteSeoPage' })
    override async Delete(
        @Body() input: SeoPage,
        @Req() req?: any,
    ) {
        return await super.Delete(input, req);
    }
}
