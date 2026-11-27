import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { SeoBackLink } from "../models/seo-back-link.entity";
import { SeoBackLinkService } from "../services/seo-back-link.service";

export class SyncPayloadDaoSeoBackLink extends SyncPayloadDao<SeoBackLink> {
    @ApiProperty({ type: SeoBackLink })
    override data?: SeoBackLink;
}

export class ObterListaSeoBackLink {
    @ApiProperty({ nullable: true, required: false })
    skip?: number;
    @ApiProperty({ nullable: true, required: false })
    take?: number;
    @ApiProperty({ nullable: true, required: false })
    where?: FindOptionsWhere<SeoBackLink>[] | FindOptionsWhere<SeoBackLink>;
    @ApiProperty({ nullable: true, required: false })
    search?: string;
    @ApiProperty({ nullable: true, required: false })
    orderBy?: any;
    @ApiProperty({ nullable: true, required: false, type: String, isArray: true })
    tenantIds?: string[];
}

@ApiTags('SeoBackLink')
@Controller('SeoBackLink')
export class SeoBackLinkController extends ControllerDaoBase<SeoBackLinkService, SeoBackLink> {
    constructor(service: SeoBackLinkService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: SeoBackLink })
    @ApiOperation({ operationId: 'SyncSeoBackLink' })
    override async Sync(
        @Body() body: SyncPayloadDaoSeoBackLink,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: SeoBackLink })
    @ApiOperation({ operationId: 'GetByInternalIdSeoBackLink' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: SeoBackLink, isArray: true })
    @ApiOperation({ operationId: 'GetListSeoBackLink' })
    override async GetList(
        @Body() input: ObterListaSeoBackLink,
        @Req() req?: any,
    ) {
        return await super.GetList({
            ...input,
            relations: {
                pagina: true,
            },
        }, req);
    }

    @Post('Delete')
    @ApiResponse({ type: SeoBackLink })
    @ApiOperation({ operationId: 'DeleteSeoBackLink' })
    override async Delete(
        @Body() input: SeoBackLink,
        @Req() req?: any,
    ) {
        return await super.Delete(input, req);
    }
}
