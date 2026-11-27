import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CommentMeta } from "../models/comment-meta.entity";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { CommentMetaService } from "../services/comment-meta.service";

export class SyncPayloadDaoCommentMeta extends SyncPayloadDao<CommentMeta> {
    @ApiProperty({ type: CommentMeta })
    override data?: CommentMeta;
}

export class ObterListaCommentMeta {
    @ApiProperty({ required: false })
    skip?: number;
    @ApiProperty({ required: false })
    take?: number;
    @ApiProperty({ required: false })
    where?: FindOptionsWhere<CommentMeta>[] | FindOptionsWhere<CommentMeta>;
    @ApiProperty({ required: false })
    search?: string;
    @ApiProperty({ required: false })
    orderBy?: any;
}

@ApiTags('CommentMeta')
@Controller('CommentMeta')
export class CommentMetaController extends ControllerDaoBase<CommentMetaService, CommentMeta> {
    constructor(service: CommentMetaService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: CommentMeta })
    @ApiOperation({ operationId: 'SyncCommentMeta' })
    override async Sync(
        @Body() body: SyncPayloadDaoCommentMeta,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: CommentMeta })
    @ApiOperation({ operationId: 'GetByInternalIdCommentMeta' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: CommentMeta, isArray: true })
    @ApiOperation({ operationId: 'GetListCommentMeta' })
    override async GetList(
        @Body() input: ObterListaCommentMeta,
        @Req() req?: any,
    ) {
        return await super.GetList({
            ...input,
            relations: { comment: true },
        }, req);
    }

    @Post('Delete')
    @ApiResponse({ type: CommentMeta })
    @ApiOperation({ operationId: 'DeleteCommentMeta' })
    override async Delete(
        @Body() input: CommentMeta,
        @Req() req?: any,
    ) {
        return await super.Delete(input, req);
    }
}
