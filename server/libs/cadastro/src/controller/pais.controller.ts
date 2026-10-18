import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Pais } from "../model/pais.entity";
import { ControllerDaoBase } from "@ci/manager";
import { PaisService } from "../service/pais.service";
import { SyncPayloadDaoPais } from "../dto/sync-payload-dao-pais";
import { ObterListaPais } from "../dto/obter-lista-pais";
import { GetByInternalIdInputDto } from "./GetByInternalIdInputDto";
@ApiTags('Pais')
@Controller('Pais')
export class PaisController extends ControllerDaoBase<PaisService, Pais> {
    constructor(
        service: PaisService,
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: Pais,
    })
    @ApiOperation({
        operationId: 'SyncPais'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoPais,
        @Req() req?: any,
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
    @Post('GetByInternalId')
    @ApiResponse({
        type: Pais,
    })
    @ApiOperation({
        operationId: 'GetByInternalIdPais',
    })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }
    @Post('GetList')
    @ApiResponse({
        type: Pais, isArray: true
    })
    @ApiOperation({
        operationId: 'GetListPais'
    })
    override async GetList(
        @Body() input: ObterListaPais,
        @Req() req?: any,
    ) {
        return super.GetList(input, req);
    }
    @Post('Delete')
    @ApiResponse({
        type: Pais,
    })
    @ApiOperation({
        operationId: 'DeletePais',
    })
    override async Delete(
        @Body() body: Pais,
        @Req() req?: any,
    ) {
        return await super.Delete(body, req);
    }
}