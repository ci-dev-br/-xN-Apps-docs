import { Body, Controller, Post, Request } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Website } from "../models/website.entity";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { WebsiteService } from "../services/website.service";
export class SyncPayloadDaoWebsite extends SyncPayloadDao<Website> {
    @ApiProperty({ type: Website })
    override data?: Website;
}
export class ObterListaWebsite {
    // override data?: Website;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<Website>[] | FindOptionsWhere<Website>;
}
export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
@ApiTags('Website')
@Controller('Website')
export class WebsiteController extends ControllerDaoBase<WebsiteService, Website> {
    constructor(
        service: WebsiteService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: Website,
    })
    @ApiOperation({
        operationId: 'SyncWebsite'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoWebsite,
        @Request() req: Request,
    ) {
        try {
            return await super.Sync(body, req)
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
        type: Website, isArray: true
    })
    @ApiOperation({
        operationId: 'GetListWebsite'
    })
    override async GetList(
        @Body() input: ObterListaWebsite,
        @Request() req: Request,
    ) {
        try {
            return super.GetList(input, req);
        } catch (error) {
            return {
                status: 500,
                message: 'Erro ao obter lista de Website',
                detahes: error.message,
                stack: error.stack
            } as any
        }
    }
    @Post('DeleteWebsite')
    @ApiResponse({
        type: Website, isArray: true
    })
    @ApiOperation({
        operationId: 'DeleteWebsite'
    })
    override async Delete(
        @Body() input: Website,
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

}