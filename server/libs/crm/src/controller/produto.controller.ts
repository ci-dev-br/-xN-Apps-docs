import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/core";
import { Produto } from "../models/produto";
import { ProdutoService } from "../service/produto.service";
export class SyncPayloadDaoProduto extends SyncPayloadDao<Produto> {
    @ApiProperty({ type: Produto })
    override data?: Produto;
}
export class ProdutoCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    where?: any;
    @ApiProperty({ nullable: true, required: false })
    take?: number;
    @ApiProperty({ nullable: true, required: false })
    skip?: number;
    @ApiProperty({ nullable: true, required: false })
    orderBy?: any;
}
@ApiTags('Produto')
@Controller('Produto')
export class ProdutoController extends ControllerDaoBase<ProdutoService, Produto> {
    constructor(service: ProdutoService) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type:
            SyncPayloadDaoProduto
    })
    @ApiOperation({
        operationId: 'SyncProduto'
    })
    override async Sync(
        @Body() input: SyncPayloadDaoProduto,
        @Req() req?: any,
    ) {
        try {
            return await super.Sync(input, req);
        } catch (err) {
            console.trace(err);
        }
    }
    @Post('Get')
    @ApiResponse({
        type:
            Produto,
        isArray: true
    })
    @ApiOperation({
        operationId: 'GetListProduto',
    })
    override async GetList(
        @Body() input: ProdutoCotrollerGetInputDto,
        @Req() req,
    ) {
        try {
            return await super.GetList(input, req);
        } catch (err) {
            console.trace(err);
        }
    }
}