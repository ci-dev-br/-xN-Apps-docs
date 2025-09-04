 import { Body, Controller, Post } from "@nestjs/common";
import { CodeBlockService } from "../service/code-block.service";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/core";
import { CodeBlock } from "../models/code-block.entity";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
export class SyncPayloadDaoCodeBlock extends SyncPayloadDao<CodeBlock> {
    @ApiProperty({ type: CodeBlock })
    override data?: CodeBlock;
}
export class ObterListaCodeBlock {
    // override data?: CodeBlock;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<CodeBlock>[] | FindOptionsWhere<CodeBlock>;
}
export class CodeBlockCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
/**
 * CodeBlock Controller
 */
@ApiTags('CodeBlock')
@Controller('CodeBlock')
export class CodeBlockController extends ControllerDaoBase<CodeBlockService, CodeBlock> {
    @Post('Sync')
    @ApiResponse({
        type: SyncPayloadDaoCodeBlock
    })
    @ApiOperation({
        operationId: 'SyncCodeBlock'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoCodeBlock,
    ) {
        return await super.Sync(body)
    }
    @Post('GetList')
    @ApiResponse({
        type:
            SyncPayloadDaoCodeBlock
    })
    @ApiOperation({
        operationId: 'GetListCodeBlock'
    })
    override async GetList(
        @Body() input: ObterListaCodeBlock,
    ) {
        return super.GetList(input);
    }
}