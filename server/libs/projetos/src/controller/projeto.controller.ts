import { Body, Controller, Post } from "@nestjs/common";
import { ProjetoService } from "../service/projeto.service";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/core";
import { Projeto } from "../models/projeto.entity";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
export class SyncPayloadDaoProjeto extends SyncPayloadDao<Projeto> {
    @ApiProperty({ type: Projeto })
    override data?: Projeto;
}
export class ObterListaProjeto {
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<Projeto>[] | FindOptionsWhere<Projeto>;
}
export class ProjetoCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
/**
 * Projeto Controller
 */
@ApiTags('Projeto')
@Controller('Projeto')
export class ProjetoController extends ControllerDaoBase<ProjetoService, Projeto> {
    @Post('Sync')
    @ApiResponse({
        type: SyncPayloadDaoProjeto
    })
    @ApiOperation({
        operationId: 'SyncProjeto'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoProjeto,
    ) {
        return await super.Sync(body)
    }
    @Post('GetList')
    @ApiResponse({
        type:
            SyncPayloadDaoProjeto
    })
    @ApiOperation({
        operationId: 'GetListProjeto'
    })
    override async GetList(
        @Body() input: ObterListaProjeto,
    ) {
        return super.GetList(input);
    }
}