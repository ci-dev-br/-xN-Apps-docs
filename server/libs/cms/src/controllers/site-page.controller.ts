import { Body, Controller, Post, Request } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SitePage } from "../models/site-page.entity";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { SitePageService } from "../services/site-page.service";
import { IHaveRequiredToSearch } from "./required-to-search";
export class SyncPayloadDaoSitePage extends SyncPayloadDao<SitePage> {
    @ApiProperty({ type: SitePage })
    override data?: SitePage;
}
export class ObterListaSitePage implements IHaveRequiredToSearch {
    @ApiProperty({
        enum: ['website'],
    })
    requiredToSearch;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({
    })
    where?: FindOptionsWhere<SitePage>[] | FindOptionsWhere<SitePage>;
}
export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
// export class FiltersSitePageOutput {
//     @ApiProperty({ nullable: true, required: false, isArray: true })
//     required = ['website'];
// }
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
        return await super.Sync(body, req);
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
        try {
            return super.GetList({
                ...input, relations: {
                    website: true,
                }
            }, req);
        } catch (error) {
            return {
                status: 500,
                message: 'Erro ao obter lista de Website',
                detahes: error.message,
                stack: error.stack
            } as any
        }
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
        try {
            return super.Delete(input, req);
        } catch (error) {
            return {
                status: 500,
                message: 'Erro ao obter lista de Website',
                detahes: error.message,
                stack: error.stack
            } as any
        }
    }
    // @Post('getFilters')
    // @ApiResponse({
    //     type: FiltersSitePageOutput
    // })
    // @ApiOperation({
    //     operationId: 'getFiltersSitePage'
    // })
    // /* override */ async getFilters(
    //     @Body() input: SitePage,
    //     @Request() req: Request,
    // 
    // ) {
    //     try {
    //         // return super.getFilters(input, req);
    //     } catch (error) {
    //         return {
    //             status: 500,
    //             message: 'Erro ao obter lista de Website',
    //             detahes: error.message,
    //             stack: error.stack
    //         } as any
    //     }
    // 
    // }
}