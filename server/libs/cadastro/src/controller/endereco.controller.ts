import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Endereco } from "../model/endereco.entity";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { EnderecoService } from "../service/endereco.service";
export class SyncPayloadDaoEndereco extends SyncPayloadDao<Endereco> {
    @ApiProperty({ type: Endereco })
    override data?: Endereco;
}
export class ObterListaEndereco {
    // override data?: Endereco;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<Endereco>[] | FindOptionsWhere<Endereco>;
}
export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
@ApiTags('Endereco')
@Controller('Endereco')
export class EnderecoController extends ControllerDaoBase<EnderecoService, Endereco> {
    @Post('Sync')
    @ApiResponse({
        type: SyncPayloadDaoEndereco,
    })
    @ApiOperation({
        operationId: 'EnderecoSync',
        description: 'sync',
    })
    override async Sync(
        @Body() body: SyncPayloadDaoEndereco,
    ) {
        return await super.Sync(body)
    }
    @Post('Get')
    @ApiResponse({
        type:
            SyncPayloadDaoEndereco
    })
    @ApiOperation({
        operationId: 'EnderecoGet',
        description: 'get',
    })
    override async GetList(
        @Body() input: ObterListaEndereco,
    ) {
        return super.GetList(input);
    }
}