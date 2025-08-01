import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Pagamento } from "../models/pagamento";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { PagamentoService } from "../service/pagamento.service";
export class SyncPayloadDaoPagamento extends SyncPayloadDao<Pagamento> {
    @ApiProperty({ type: Pagamento })
    override data?: Pagamento;
}
export class ObterListaPagamento {
    // override data?: Pagamento;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<Pagamento>[] | FindOptionsWhere<Pagamento>;
}
export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
@ApiTags('Pagamento')
@Controller('Pagamento')
export class PagamentoController extends ControllerDaoBase<PagamentoService, Pagamento> {
    constructor(
        service: PagamentoService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: Pagamento,
    })
    @ApiOperation({
        operationId: 'SyncPagamento'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoPagamento,
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
        type: Pagamento, isArray: true
    })
    @ApiOperation({
        operationId: 'GetListPagamento'
    })
    override async GetList(
        @Body() input: ObterListaPagamento,
    ) {
        return super.GetList(input);
    }
}