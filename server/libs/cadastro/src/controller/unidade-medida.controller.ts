import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UnidadeMedida } from "../model/unidade-medida.entity";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
export class SyncPayloadDaoUnidadeMedida extends SyncPayloadDao<UnidadeMedida> {
    @ApiProperty({ type: UnidadeMedida })
    override data?: UnidadeMedida;
}
export class ObterListaPessoa {
    // override data?: UnidadeMedida;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<UnidadeMedida>[] | FindOptionsWhere<UnidadeMedida>;
}
export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
@ApiTags('UnidadeMedida')
@Controller('UnidadeMedida')
export class UnidadeMedidaController extends ControllerDaoBase<UnidadeMedidaService, UnidadeMedida> {
    @Post('Sync')
    @ApiResponse({
        type:
            SyncPayloadDaoUnidadeMedida
    })
    @ApiOperation({
        operationId: 'UnidadeMedidaSync'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoUnidadeMedida,
    ) {
        return await super.Sync(body)
    }
    @Post('Get')
    @ApiResponse({
        type:
            SyncPayloadDaoUnidadeMedida
    })
    @ApiOperation({
        operationId: 'PessoaGet'
    })
    override async GetList(
        @Body() input: ObterListaPessoa,
    ) {
        return super.GetList(input);
    }
}