import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { CampanhaMarketing } from "../models/campanha-marketing";
import { CampanhaMarketingService } from "../service/campanha-marketing.service";

export class SyncPayloadDaoCampanhaMarketing extends SyncPayloadDao<CampanhaMarketing> {
    @ApiProperty({ type: CampanhaMarketing })
    override data?: CampanhaMarketing;
}

export class ObterListaCampanhaMarketing {
    @ApiProperty({ required: false })
    skip?: number;
    @ApiProperty({ required: false })
    take?: number;
    @ApiProperty({ required: false })
    where?: FindOptionsWhere<CampanhaMarketing>[] | FindOptionsWhere<CampanhaMarketing>;
}

@ApiTags('CampanhaMarketing')
@Controller('CampanhaMarketing')
export class CampanhaMarketingController extends ControllerDaoBase<CampanhaMarketingService, CampanhaMarketing> {
    constructor(service: CampanhaMarketingService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: CampanhaMarketing })
    @ApiOperation({ operationId: 'SyncCampanhaMarketing' })
    override async Sync(
        @Body() body: SyncPayloadDaoCampanhaMarketing,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: CampanhaMarketing })
    @ApiOperation({ operationId: 'GetByInternalIdCampanhaMarketing' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: CampanhaMarketing, isArray: true })
    @ApiOperation({ operationId: 'GetListCampanhaMarketing' })
    override async GetList(
        @Body() input: ObterListaCampanhaMarketing,
        @Req() req?: any,
    ) {
        return await super.GetList(input, req);
    }

    @Post('Delete')
    @ApiResponse({ type: CampanhaMarketing })
    @ApiOperation({ operationId: 'DeleteCampanhaMarketing' })
    override async Delete(
        @Body() body: CampanhaMarketing,
        @Req() req?: any,
    ) {
        return await super.Delete(body, req);
    }
}
