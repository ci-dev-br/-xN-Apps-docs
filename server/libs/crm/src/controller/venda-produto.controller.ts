import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { VendaProduto } from "../models/venda-produto";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { VendaProdutoService } from "../service/venda-produto.service";

export class SyncPayloadDaoVendaProduto extends SyncPayloadDao<VendaProduto> {
    @ApiProperty({ type: VendaProduto })
    override data?: VendaProduto;
}

export class ObterListaVendaProduto {
    @ApiProperty({ required: false })
    skip?: number;
    @ApiProperty({ required: false })
    take?: number;
    @ApiProperty({ required: false })
    where?: FindOptionsWhere<VendaProduto>[] | FindOptionsWhere<VendaProduto>;
}

@ApiTags('VendaProduto')
@Controller('VendaProduto')
export class VendaProdutoController extends ControllerDaoBase<VendaProdutoService, VendaProduto> {
    constructor(service: VendaProdutoService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: VendaProduto })
    @ApiOperation({ operationId: 'SyncVendaProduto' })
    override async Sync(
        @Body() body: SyncPayloadDaoVendaProduto,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: VendaProduto })
    @ApiOperation({ operationId: 'GetByInternalIdVendaProduto' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: VendaProduto, isArray: true })
    @ApiOperation({ operationId: 'GetListVendaProduto' })
    override async GetList(
        @Body() input: ObterListaVendaProduto,
        @Req() req?: any,
    ) {
        return await super.GetList(input, req);
    }

    @Post('Delete')
    @ApiResponse({ type: VendaProduto })
    @ApiOperation({ operationId: 'DeleteVendaProduto' })
    override async Delete(
        @Body() body: VendaProduto,
        @Req() req?: any,
    ) {
        return await super.Delete(body, req);
    }
}
