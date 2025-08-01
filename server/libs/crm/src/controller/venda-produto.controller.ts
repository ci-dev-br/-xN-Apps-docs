import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { VendaProduto } from "../models/venda-produto";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { VendaProdutoService } from "../service/venda-produto.service";
export class SyncPayloadDaoVendaProduto extends SyncPayloadDao<VendaProduto> {
    @ApiProperty({ type: VendaProduto })
    override data?: VendaProduto;
}
export class ObterListaVendaProduto {
    // override data?: VendaProduto;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<VendaProduto>[] | FindOptionsWhere<VendaProduto>;
}
export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
@ApiTags('VendaProduto')
@Controller('VendaProduto')
export class VendaProdutoController extends ControllerDaoBase<VendaProdutoService, VendaProduto> {
    constructor(
        service: VendaProdutoService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: VendaProduto,
    })
    @ApiOperation({
        operationId: 'SyncVendaProduto'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoVendaProduto,
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
        type: VendaProduto, isArray: true
    })
    @ApiOperation({
        operationId: 'GetListVendaProduto'
    })
    override async GetList(
        @Body() input: ObterListaVendaProduto,
    ) {
        return super.GetList(input);
    }
}