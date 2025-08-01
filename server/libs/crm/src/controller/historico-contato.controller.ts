import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { HistoricoContato } from "../models/historico-contato";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { HistoricoContatoService } from "../service/historico-contato.service";
export class SyncPayloadDaoHistoricoContato extends SyncPayloadDao<HistoricoContato> {
    @ApiProperty({ type: HistoricoContato })
    override data?: HistoricoContato;
}
export class ObterListaHistoricoContato {
    // override data?: HistoricoContato;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<HistoricoContato>[] | FindOptionsWhere<HistoricoContato>;
}
export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
@ApiTags('HistoricoContato')
@Controller('HistoricoContato')
export class HistoricoContatoController extends ControllerDaoBase<HistoricoContatoService, HistoricoContato> {
    constructor(
        service: HistoricoContatoService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: HistoricoContato,
    })
    @ApiOperation({
        operationId: 'SyncHistoricoContato'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoHistoricoContato,
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
        type: HistoricoContato, isArray: true
    })
    @ApiOperation({
        operationId: 'GetListHistoricoContato'
    })
    override async GetList(
        @Body() input: ObterListaHistoricoContato,
    ) {
        return super.GetList(input);
    }
}