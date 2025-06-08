import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CommentMeta } from "../models/comment-meta.entity";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { CommentMetaService } from "../services/comment-meta.service";
export class SyncPayloadDaoCommentMeta extends SyncPayloadDao<CommentMeta> {
    @ApiProperty({ type: CommentMeta })
    override data?: CommentMeta;
}
export class ObterListaCommentMeta {
    // override data?: CommentMeta;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<CommentMeta>[] | FindOptionsWhere<CommentMeta>;
}
export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
@ApiTags('CommentMeta')
@Controller('CommentMeta')
export class CommentMetaController extends ControllerDaoBase<CommentMetaService, CommentMeta> {
    constructor(
        service: CommentMetaService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: CommentMeta,
    })
    @ApiOperation({
        operationId: 'SyncCommentMeta'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoCommentMeta,
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
        type: CommentMeta, isArray: true
    })
    @ApiOperation({
        operationId: 'GetListCommentMeta'
    })
    override async GetList(
        @Body() input: ObterListaCommentMeta,
    ) {
        return super.GetList(input);
    }
}