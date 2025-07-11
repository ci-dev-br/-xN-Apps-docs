import { Body, Controller, Post } from "@nestjs/common";
import { LancamentoService } from "../service/lancamento.service";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/core";
import { Lancamento } from "../model/lancamento.entity";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
export class SyncPayloadDaoLancamento extends SyncPayloadDao<Lancamento> {
    @ApiProperty({ type: Lancamento })
    override data?: Lancamento;
}
export class ObterListaLancamento {
    // override data?: Lancamento;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<Lancamento>[] | FindOptionsWhere<Lancamento>;
}
export class LancamentoCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
/**
 * Lancamento Controller
 */
@ApiTags('Lancamento')
@Controller('Lancamento')
export class LancamentoController extends ControllerDaoBase<LancamentoService, Lancamento> {
    @Post('Sync')
    @ApiResponse({
        type: SyncPayloadDaoLancamento
    })
    @ApiOperation({
        operationId: 'SyncLancamento'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoLancamento,
    ) {
        return await super.Sync(body)
    }
    @Post('GetList')
    @ApiResponse({
        type:
            SyncPayloadDaoLancamento
    })
    @ApiOperation({
        operationId: 'GetListLancamento'
    })
    override async GetList(
        @Body() input: ObterListaLancamento,
    ) {
        return super.GetList(input);
    }
}