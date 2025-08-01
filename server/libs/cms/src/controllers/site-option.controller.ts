import { Body, Controller, Post, Request } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SiteOption } from "../models/site-option.entity";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { SiteOptionService } from "../services/site-option.service";
export class SyncPayloadDaoSiteOption extends SyncPayloadDao<SiteOption> {
    @ApiProperty({ type: SiteOption })
    override data?: SiteOption;
}
export class ObterListaSiteOption {
    // override data?: SiteOption;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<SiteOption>[] | FindOptionsWhere<SiteOption>;
}
export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
@ApiTags('SiteOption')
@Controller('SiteOption')
export class SiteOptionController extends ControllerDaoBase<SiteOptionService, SiteOption> {
    constructor(
        service: SiteOptionService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: SiteOption,
    })
    @ApiOperation({
        operationId: 'SyncSiteOption'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoSiteOption,
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
        type: SiteOption, isArray: true
    })
    @ApiOperation({
        operationId: 'GetListSiteOption'
    })
    override async GetList(
        @Body() input: ObterListaSiteOption,
        @Request() req: Request,
    ) {
        return super.GetList(input);
    }
    @Post('Delete')
    @ApiResponse({
        type: SiteOption, isArray: true
    })
    @ApiOperation({
        operationId: 'DeleteSiteOption'
    })
    override async Delete(
        @Body() input: SiteOption,
        @Request() req: Request,
    ) {
        return super.Delete(input, req);
    }
}