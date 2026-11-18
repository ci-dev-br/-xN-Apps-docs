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

export class BlockSnapshotDto {
    @ApiProperty({ required: false, nullable: true })
    internalId?: string;

    @ApiProperty({ required: false, nullable: true })
    hash?: string;

    @ApiProperty({ required: false, nullable: true })
    snap?: Record<string, any>;

    @ApiProperty({ required: false, nullable: true })
    createdAt?: Date;
}

/**
 * Controller para gerenciamento de blocos de telas dinâmicas (Block).
 */
@ApiTags('Block')
@Controller('Block')
export class BlockController extends ControllerDaoBase<BlockService, Block> {
    constructor(private readonly blockService: BlockService) {
        super(blockService);
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

    @Post('GetSnapshots')
    @ApiResponse({ type: BlockSnapshotDto, isArray: true })
    @ApiOperation({ operationId: 'GetSnapshotsBlock' })
    async GetSnapshots(@Body() input: GetByInternalIdInputDto, @Req() req?: any) {
        return await this.blockService.getSnapshots(input?.internalId, req);
    }
}
