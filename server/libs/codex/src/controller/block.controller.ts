import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/core";
import { GetByInternalIdInputDto } from "@ci/manager";
import { Block } from "../models/block.entity";
import { BlockService } from "../service/block.service";

export class SyncPayloadDaoBlock extends SyncPayloadDao<Block> {
    @ApiProperty({ type: Block })
    override data?: Block;
}

export class ObterListaBlock {
    @ApiProperty({ required: false, nullable: true })
    skip?: number;

    @ApiProperty({ required: false, nullable: true })
    take?: number;

    @ApiProperty({ required: false, nullable: true })
    where?: FindOptionsWhere<Block>[] | FindOptionsWhere<Block>;
}

/**
 * Controller para gerenciamento de blocos de telas dinâmicas (Block).
 */
@ApiTags('Block')
@Controller('Block')
export class BlockController extends ControllerDaoBase<BlockService, Block> {
    constructor(service: BlockService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: SyncPayloadDaoBlock })
    @ApiOperation({ operationId: 'SyncBlock' })
    override async Sync(@Body() body: SyncPayloadDaoBlock, @Req() req?: any) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: Block })
    @ApiOperation({ operationId: 'GetByInternalIdBlock' })
    override async GetByInternalId(@Body() input: GetByInternalIdInputDto, @Req() req?: any) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: SyncPayloadDaoBlock })
    @ApiOperation({ operationId: 'GetListBlock' })
    override async GetList(@Body() input: ObterListaBlock, @Req() req?: any) {
        return await super.GetList(input, req);
    }

    @Post('Delete')
    @ApiResponse({ type: Block })
    @ApiOperation({ operationId: 'DeleteBlock' })
    override async Delete(@Body() body: Block, @Req() req?: any) {
        return await super.Delete(body, req);
    }
}
