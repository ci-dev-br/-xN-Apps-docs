import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UnidadeMedida } from "../model/unidade-medida.entity";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { UnidadeMedidaService } from "../service/unidade-medida.service";
import { GetByInternalIdInputDto } from "./GetByInternalIdInputDto";
export class SyncPayloadDaoUnidadeMedida extends SyncPayloadDao<UnidadeMedida> {
    @ApiProperty({ type: UnidadeMedida })
    override data?: UnidadeMedida;
}
export class ObterListaUnidadeMedida {
    // override data?: UnidadeMedida;
    @ApiProperty({ required: false, nullable: true })
    skip?: number;
    @ApiProperty({ required: false, nullable: true })
    take?: number;
    @ApiProperty({ required: false, nullable: true, type: UnidadeMedida })
    where?: FindOptionsWhere<UnidadeMedida>[] | FindOptionsWhere<UnidadeMedida>;
    @ApiProperty({ required: false, nullable: true, type: UnidadeMedida })
    filter?: Partial<UnidadeMedida>;
    @ApiProperty({ required: false, nullable: true })
    search?: string;
    @ApiProperty({ required: false, nullable: true })
    orderBy?: Record<string, 'ASC' | 'DESC'>;
}
export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
@ApiTags('UnidadeMedida')
@Controller('UnidadeMedida')
export class UnidadeMedidaController extends ControllerDaoBase<UnidadeMedidaService, UnidadeMedida> {
    constructor(
        service: UnidadeMedidaService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: UnidadeMedida,
    })
    @ApiOperation({
        operationId: 'SyncUnidadeMedida'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoUnidadeMedida,
        @Req() req?: any,
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
    @Post('GetByInternalId')
    @ApiResponse({
        type: UnidadeMedida,
    })
    @ApiOperation({
        operationId: 'GetByInternalIdUnidadeMedida',
    })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }
    @Post('GetList')
    @ApiResponse({
        type: UnidadeMedida, isArray: true
    })
    @ApiOperation({
        operationId: 'GetListUnidadeMedida'
    })
    override async GetList(
        @Body() input: ObterListaUnidadeMedida,
        @Req() req?: any,
    ) {
        return super.GetList(input, req);
    }
    @Post('Delete')
    @ApiResponse({
        type: UnidadeMedida,
    })
    @ApiOperation({
        operationId: 'DeleteUnidadeMedida',
    })
    override async Delete(
        @Body() body: UnidadeMedida,
        @Req() req?: any,
    ) {
        return await super.Delete(body, req);
    }
}