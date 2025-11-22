import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Pais } from "../model/pais.entity";
import { ControllerDaoBase } from "@ci/manager";
import { PaisService } from "../service/pais.service";
import { SyncPayloadDaoPais } from "../dto/sync-payload-dao-pais";
import { ObterListaPais } from "../dto/ObterListaPais";
@ApiTags('Pais')
@Controller('Pais')
export class PaisController extends ControllerDaoBase<PaisService, Pais> {
    constructor(
        service: PaisService
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
        type: Pais, isArray: true
    })
    @ApiOperation({
        operationId: 'GetListPais'
    })
    override async GetList(
        @Body() input: ObterListaPais,
    ) {
        return super.GetList(input);
    }
}