 import { Body, Controller, Post } from "@nestjs/common";
import { PessoaService } from "../service/conta.service";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/core";
import { Lancamento } from "../model/lancamento.entity";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
export class SyncPayloadDaoPessoa extends SyncPayloadDao<Lancamento> {
    @ApiProperty({ type: Lancamento })
    override data?: Lancamento;
}
export class ObterListaPessoa {
    // override data?: Lancamento;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<Lancamento>[] | FindOptionsWhere<Lancamento>;
}
export class PessoaCotrollerGetInputDto {
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
export class PessoaController extends ControllerDaoBase<PessoaService, Lancamento> {
    @Post('Sync')
    @ApiResponse({
        type: SyncPayloadDaoPessoa
    })
    @ApiOperation({
        operationId: 'SyncPessoa'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoPessoa,
    ) {
        return await super.Sync(body)
    }
    @Post('GetList')
    @ApiResponse({
        type:
            SyncPayloadDaoPessoa
    })
    @ApiOperation({
        operationId: 'GetListPessoa'
    })
    override async GetList(
        @Body() input: ObterListaPessoa,
    ) {
        return super.GetList(input);
    }
}