import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { SeoKeyWord } from "../models/seo-key-word.entity";
import { SeoKeyWordService } from "../services/seo-key-word.service";

export class SyncPayloadDaoSeoKeyWord extends SyncPayloadDao<SeoKeyWord> {
    @ApiProperty({ type: SeoKeyWord })
    override data?: SeoKeyWord;
}

export class ObterListaSeoKeyWord {
    @ApiProperty({ nullable: true, required: false })
    skip?: number;
    @ApiProperty({ nullable: true, required: false })
    take?: number;
    @ApiProperty({ nullable: true, required: false })
    where?: FindOptionsWhere<SeoKeyWord>[] | FindOptionsWhere<SeoKeyWord>;
    @ApiProperty({ nullable: true, required: false })
    search?: string;
    @ApiProperty({ nullable: true, required: false })
    orderBy?: any;
    @ApiProperty({ nullable: true, required: false, type: String, isArray: true })
    tenantIds?: string[];
}

@ApiTags('SeoKeyWord')
@Controller('SeoKeyWord')
export class SeoKeyWordController extends ControllerDaoBase<SeoKeyWordService, SeoKeyWord> {
    constructor(service: SeoKeyWordService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: SeoKeyWord })
    @ApiOperation({ operationId: 'SyncSeoKeyWord' })
    override async Sync(
        @Body() body: SyncPayloadDaoSeoKeyWord,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: SeoKeyWord })
    @ApiOperation({ operationId: 'GetByInternalIdSeoKeyWord' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: SeoKeyWord, isArray: true })
    @ApiOperation({ operationId: 'GetListSeoKeyWord' })
    override async GetList(
        @Body() input: ObterListaSeoKeyWord,
        @Req() req?: any,
    ) {
        return await super.GetList({
            ...input,
            relations: {
                dominio: true,
            },
        }, req);
    }

    @Post('Delete')
    @ApiResponse({ type: SeoKeyWord })
    @ApiOperation({ operationId: 'DeleteSeoKeyWord' })
    override async Delete(
        @Body() input: SeoKeyWord,
        @Req() req?: any,
    ) {
        return await super.Delete(input, req);
    }
}
