import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Website } from "../models/website.entity";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { WebsiteService } from "../services/website.service";

export class SyncPayloadDaoWebsite extends SyncPayloadDao<Website> {
    @ApiProperty({ type: Website })
    override data?: Website;
}

export class ObterListaWebsite {
    @ApiProperty({ nullable: true, required: false })
    skip?: number;
    @ApiProperty({ nullable: true, required: false })
    take?: number;
    @ApiProperty({ nullable: true, required: false })
    where?: FindOptionsWhere<Website>[] | FindOptionsWhere<Website>;
    @ApiProperty({ nullable: true, required: false })
    search?: string;
    @ApiProperty({ nullable: true, required: false })
    orderBy?: any;
}

@ApiTags('Website')
@Controller('Website')
export class WebsiteController extends ControllerDaoBase<WebsiteService, Website> {
    constructor(service: WebsiteService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: Website })
    @ApiOperation({ operationId: 'SyncWebsite' })
    override async Sync(
        @Body() body: SyncPayloadDaoWebsite,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: Website })
    @ApiOperation({ operationId: 'GetByInternalIdWebsite' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: Website, isArray: true })
    @ApiOperation({ operationId: 'GetListWebsite' })
    override async GetList(
        @Body() input: ObterListaWebsite,
        @Req() req?: any,
    ) {
        return await super.GetList({
            ...input,
            relations: {
                admin: true,
                users: true,
            },
        }, req);
    }

    @Post('Delete')
    @ApiResponse({ type: Website })
    @ApiOperation({ operationId: 'DeleteWebsite' })
    override async Delete(
        @Body() input: Website,
        @Req() req?: any,
    ) {
        return await super.Delete(input, req);
    }
}
