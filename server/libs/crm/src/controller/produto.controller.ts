import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Produto } from "../models/produto";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { ProdutoService } from "../service/produto.service";
export class SyncPayloadDaoProduto extends SyncPayloadDao<Produto> {
    @ApiProperty({ type: Produto })
    override data?: Produto;
}
export class ObterListaProduto {
    // override data?: Produto;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<Produto>[] | FindOptionsWhere<Produto>;
}
export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
@ApiTags('Produto')
@Controller('Produto')
export class ProdutoController extends ControllerDaoBase<ProdutoService, Produto> {
    constructor(
        service: ProdutoService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: Produto,
    })
    @ApiOperation({
        operationId: 'SyncProduto'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoProduto,
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
        type: Produto, isArray: true
    })
    @ApiOperation({
        operationId: 'GetListProduto'
    })
    override async GetList(
        @Body() input: ObterListaProduto,
    ) {
        return super.GetList(input);
    }
}