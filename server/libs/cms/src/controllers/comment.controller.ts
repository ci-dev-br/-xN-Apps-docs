import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Comment } from "../models/comment.entity";
import { ControllerDaoBase, GetByInternalIdInputDto, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { CommentService } from "../services/comment.service";

export class SyncPayloadDaoComment extends SyncPayloadDao<Comment> {
    @ApiProperty({ type: Comment })
    override data?: Comment;
}

export class ObterListaComment {
    @ApiProperty({ required: false })
    skip?: number;
    @ApiProperty({ required: false })
    take?: number;
    @ApiProperty({ required: false })
    where?: FindOptionsWhere<Comment>[] | FindOptionsWhere<Comment>;
    @ApiProperty({ required: false })
    search?: string;
    @ApiProperty({ required: false })
    orderBy?: any;
}

@ApiTags('Comment')
@Controller('Comment')
export class CommentController extends ControllerDaoBase<CommentService, Comment> {
    constructor(service: CommentService) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({ type: Comment })
    @ApiOperation({ operationId: 'SyncComment' })
    override async Sync(
        @Body() body: SyncPayloadDaoComment,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({ type: Comment })
    @ApiOperation({ operationId: 'GetByInternalIdComment' })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({ type: Comment, isArray: true })
    @ApiOperation({ operationId: 'GetListComment' })
    override async GetList(
        @Body() input: ObterListaComment,
        @Req() req?: any,
    ) {
        return await super.GetList({
            ...input,
            relations: {
                post: true,
                website: true,
            },
        }, req);
    }

    @Post('Delete')
    @ApiResponse({ type: Comment })
    @ApiOperation({ operationId: 'DeleteComment' })
    override async Delete(
        @Body() input: Comment,
        @Req() req?: any,
    ) {
        return await super.Delete(input, req);
    }
}
