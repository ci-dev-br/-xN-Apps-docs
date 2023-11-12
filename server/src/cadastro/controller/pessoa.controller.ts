import { Body, Controller, Post } from "@nestjs/common";
import { PessoaService } from "../service/pessoa.service";
import { ControllerDaoBase, SyncPayloadDao } from "src/core/dao";
import { Pessoa } from "../model/pessoa.entity";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";

export class SyncPayloadDaoPessoa extends SyncPayloadDao<Pessoa>{
    @ApiProperty({ type: Pessoa })
    override data?: Pessoa;
}
/**
 * Pessoa Controller
 * 
 * 
 */
@ApiTags('Pessoa')
@Controller('Pessoa')
export class PessoaController extends ControllerDaoBase<PessoaService, Pessoa> {
    @Post('Sync')
    @ApiResponse({
        type:
            SyncPayloadDao<Pessoa>
    })
    @ApiOperation({
        operationId: 'PessoaSync'
    })
    override async sync(
        @Body() body: SyncPayloadDaoPessoa,
    ) {
        return await super.sync(body)
    }
}