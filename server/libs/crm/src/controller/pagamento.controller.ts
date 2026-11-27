import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Pagamento } from "../models/pagamento";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { PagamentoService } from "../service/pagamento.service";

export class SyncPayloadDaoPagamento extends SyncPayloadDao<Pagamento> {
    @ApiProperty({ type: Pagamento })
    override data?: Pagamento;
}

export class ObterListaPagamento {
    @ApiProperty({ required: false })
    skip?: number;
    @ApiProperty({ required: false })
    take?: number;
    @ApiProperty({ required: false })
    where?: FindOptionsWhere<Pagamento>[] | FindOptionsWhere<Pagamento>;
}

@ApiTags('Pagamento')
@Controller('Pagamento')
export class PagamentoController extends ControllerDaoBase<PagamentoService, Pagamento> {
    constructor(service: PagamentoService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: Pagamento })
    @ApiOperation({ operationId: 'SyncPagamento' })
    override async Sync(
        @Body() body: SyncPayloadDaoPagamento,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: Pagamento })
    @ApiOperation({ operationId: 'GetByInternalIdPagamento' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: Pagamento, isArray: true })
    @ApiOperation({ operationId: 'GetListPagamento' })
    override async GetList(
        @Body() input: ObterListaPagamento,
        @Req() req?: any,
    ) {
        return await super.GetList(input, req);
    }

    @Post('Delete')
    @ApiResponse({ type: Pagamento })
    @ApiOperation({ operationId: 'DeletePagamento' })
    override async Delete(
        @Body() body: Pagamento,
        @Req() req?: any,
    ) {
        return await super.Delete(body, req);
    }
}
