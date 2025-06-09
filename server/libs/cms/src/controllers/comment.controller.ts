import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Comment } from "../models/comment.entity";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { CommentService } from "../services/comment.service";
export class SyncPayloadDaoComment extends SyncPayloadDao<Comment> {
    @ApiProperty({ type: Comment })
    override data?: Comment;
}
export class ObterListaComment {
    // override data?: Comment;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<Comment>[] | FindOptionsWhere<Comment>;
}
export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
@ApiTags('Comment')
@Controller('Comment')
export class CommentController extends ControllerDaoBase<CommentService, Comment> {
    constructor(
        service: CommentService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: Comment,
    })
    @ApiOperation({
        operationId: 'SyncComment'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoComment,
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
        type: Comment, isArray: true
    })
    @ApiOperation({
        operationId: 'GetListComment'
    })
    override async GetList(
        @Body() input: ObterListaComment,
    ) {
        return super.GetList(input);
    }
}