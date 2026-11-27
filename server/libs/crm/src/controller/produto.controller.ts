import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { Produto } from "../models/produto";
import { ProdutoService } from "../service/produto.service";

export class SyncPayloadDaoProduto extends SyncPayloadDao<Produto> {
    @ApiProperty({ type: Produto })
    override data?: Produto;
}

export class ObterListaProduto {
    @ApiProperty({ required: false })
    skip?: number;
    @ApiProperty({ required: false })
    take?: number;
    @ApiProperty({ required: false })
    where?: FindOptionsWhere<Produto>[] | FindOptionsWhere<Produto>;
    @ApiProperty({ required: false })
    orderBy?: any;
}

@ApiTags('Produto')
@Controller('Produto')
export class ProdutoController extends ControllerDaoBase<ProdutoService, Produto> {
    constructor(service: ProdutoService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: Produto })
    @ApiOperation({ operationId: 'SyncProduto' })
    override async Sync(
        @Body() input: SyncPayloadDaoProduto,
        @Req() req?: any,
    ) {
        return await super.Sync(input, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: Produto })
    @ApiOperation({ operationId: 'GetByInternalIdProduto' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: Produto, isArray: true })
    @ApiOperation({ operationId: 'GetListProduto' })
    override async GetList(
        @Body() input: ObterListaProduto,
        @Req() req?: any,
    ) {
        return await super.GetList(input, req);
    }

    @Post('Delete')
    @ApiResponse({ type: Produto })
    @ApiOperation({ operationId: 'DeleteProduto' })
    override async Delete(
        @Body() body: Produto,
        @Req() req?: any,
    ) {
        return await super.Delete(body, req);
    }
}
