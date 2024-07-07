import { Body, Controller, Post } from "@nestjs/common";
import { PessoaService } from "../service/pessoa.service";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/core";
import { Pessoa } from "../model/pessoa.entity";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";

export class SyncPayloadDaoPessoa extends SyncPayloadDao<Pessoa> {
    @ApiProperty({ type: Pessoa })
    override data?: Pessoa;
}
export class ObterListaPessoa {
    // override data?: Pessoa;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<Pessoa>[] | FindOptionsWhere<Pessoa>;
}

export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
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
            SyncPayloadDaoPessoa
    })
    @ApiOperation({
        operationId: 'PessoaSync'
    })
    override async sync(
        @Body() body: SyncPayloadDaoPessoa,
    ) {
        return await super.sync(body)
    }

    @Post('Get')
    @ApiResponse({
        type:
            SyncPayloadDaoPessoa
    })
    @ApiOperation({
        operationId: 'PessoaGet'
    })
    override async get(
        @Body() input: ObterListaPessoa,
    ) {
        return super.get(input);
    }
}