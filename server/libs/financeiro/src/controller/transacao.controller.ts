import { Body, Controller, Post } from "@nestjs/common";
import { TransacaoService } from "../service/transacao.service";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/core";
import { Transacao } from "../model/transacao.entity";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
export class SyncPayloadDaoTransacao extends SyncPayloadDao<Transacao> {
    @ApiProperty({ type: Transacao })
    override data?: Transacao;
}
export class ObterListaTransacao {
    // override data?: Transacao;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<Transacao>[] | FindOptionsWhere<Transacao>;
}
export class TransacaoCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
/**
 * Transacao Controller
 */
@ApiTags('Transacao')
@Controller('Transacao')
export class TransacaoController extends ControllerDaoBase<TransacaoService, Transacao> {
    @Post('Sync')
    @ApiResponse({
        type: SyncPayloadDaoTransacao
    })
    @ApiOperation({
        operationId: 'SyncTransacao'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoTransacao,
    ) {
        return await super.Sync(body)
    }
    @Post('GetList')
    @ApiResponse({
        type:
            SyncPayloadDaoTransacao
    })
    @ApiOperation({
        operationId: 'GetListTransacao'
    })
    override async GetList(
        @Body() input: ObterListaTransacao,
    ) {
        return super.GetList(input);
    }
}