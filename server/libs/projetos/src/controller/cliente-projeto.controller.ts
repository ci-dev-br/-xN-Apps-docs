import { Body, Controller, Post } from "@nestjs/common";
import { ClienteProjetoService } from "../service/cliente-projeto.service";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/core";
import { ClienteProjeto } from "../models/cliente-projeto.entity";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
export class SyncPayloadDaoClienteProjeto extends SyncPayloadDao<ClienteProjeto> {
    @ApiProperty({ type: ClienteProjeto })
    override data?: ClienteProjeto;
}
export class ObterListaClienteProjeto {
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<ClienteProjeto>[] | FindOptionsWhere<ClienteProjeto>;
}
export class ClienteProjetoCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
/**
 * ClienteProjeto Controller
 */
@ApiTags('ClienteProjeto')
@Controller('ClienteProjeto')
export class ClienteProjetoController extends ControllerDaoBase<ClienteProjetoService, ClienteProjeto> {
    @Post('Sync')
    @ApiResponse({
        type: SyncPayloadDaoClienteProjeto
    })
    @ApiOperation({
        operationId: 'SyncClienteProjeto'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoClienteProjeto,
    ) {
        return await super.Sync(body)
    }
    @Post('GetList')
    @ApiResponse({
        type:
            SyncPayloadDaoClienteProjeto
    })
    @ApiOperation({
        operationId: 'GetListClienteProjeto'
    })
    override async GetList(
        @Body() input: ObterListaClienteProjeto,
    ) {
        return super.GetList(input);
    }
}