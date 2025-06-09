import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Links } from "../models/links.entity";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { LinksService } from "../services/links.service";
export class SyncPayloadDaoLinks extends SyncPayloadDao<Links> {
    @ApiProperty({ type: Links })
    override data?: Links;
}
export class ObterListaLinks {
    // override data?: Links;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<Links>[] | FindOptionsWhere<Links>;
}
export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
@ApiTags('Links')
@Controller('Links')
export class LinksController extends ControllerDaoBase<LinksService, Links> {
    constructor(
        service: LinksService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: Links,
    })
    @ApiOperation({
        operationId: 'SyncLinks'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoLinks,
    ) {
        try {
            return await super.Sync(body)
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
        type: Links, isArray: true
    })
    @ApiOperation({
        operationId: 'GetListLinks'
    })
    override async GetList(
        @Body() input: ObterListaLinks,
    ) {
        return super.GetList(input);
    }
}