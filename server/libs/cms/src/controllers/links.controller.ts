import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Links } from "../models/links.entity";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { LinksService } from "../services/links.service";

export class SyncPayloadDaoLinks extends SyncPayloadDao<Links> {
    @ApiProperty({ type: Links })
    override data?: Links;
}

export class ObterListaLinks {
    @ApiProperty({ required: false })
    skip?: number;
    @ApiProperty({ required: false })
    take?: number;
    @ApiProperty({ required: false })
    where?: FindOptionsWhere<Links>[] | FindOptionsWhere<Links>;
    @ApiProperty({ required: false })
    search?: string;
    @ApiProperty({ required: false })
    orderBy?: any;
}

@ApiTags('Links')
@Controller('Links')
export class LinksController extends ControllerDaoBase<LinksService, Links> {
    constructor(service: LinksService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: Links })
    @ApiOperation({ operationId: 'SyncLinks' })
    override async Sync(
        @Body() body: SyncPayloadDaoLinks,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: Links })
    @ApiOperation({ operationId: 'GetByInternalIdLinks' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: Links, isArray: true })
    @ApiOperation({ operationId: 'GetListLinks' })
    override async GetList(
        @Body() input: ObterListaLinks,
        @Req() req?: any,
    ) {
        return await super.GetList({
            ...input,
            relations: { website: true },
        }, req);
    }

    @Post('Delete')
    @ApiResponse({ type: Links })
    @ApiOperation({ operationId: 'DeleteLinks' })
    override async Delete(
        @Body() input: Links,
        @Req() req?: any,
    ) {
        return await super.Delete(input, req);
    }
}
