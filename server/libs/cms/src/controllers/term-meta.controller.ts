import { Body, Controller, Post, Request } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { TermMeta } from "../models/term-meta.entity";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { TermMetaService } from "../services/term-meta.service";
export class SyncPayloadDaoTermMeta extends SyncPayloadDao<TermMeta> {
    @ApiProperty({ type: TermMeta })
    override data?: TermMeta;
}
export class ObterListaTermMeta {
    // override data?: TermMeta;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<TermMeta>[] | FindOptionsWhere<TermMeta>;
}
export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
@ApiTags('TermMeta')
@Controller('TermMeta')
export class TermMetaController extends ControllerDaoBase<TermMetaService, TermMeta> {
    constructor(
        service: TermMetaService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: TermMeta,
    })
    @ApiOperation({
        operationId: 'SyncTermMeta'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoTermMeta,
        @Request() req: Request,
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
        type: TermMeta, isArray: true
    })
    @ApiOperation({
        operationId: 'GetListTermMeta'
    })
    override async GetList(
        @Body() input: ObterListaTermMeta,
        @Request() req: Request,
    ) {
        return super.GetList(input);
    }
    @Post('Delete')
    @ApiResponse({
        type: TermMeta
    })
    @ApiOperation({
        operationId: 'DeleteTermMeta'
    })
    override async Delete(
        @Body() input: TermMeta,
        @Request() req: Request,
    ) {
        return super.Delete(input, req);
    }
}