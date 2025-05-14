import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UnidadeMedida } from "../model/unidade-medida.entity";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { UnidadeMedidaService } from "../service/unidade-medida.service";
export class SyncPayloadDaoUnidadeMedida extends SyncPayloadDao<UnidadeMedida> {
    @ApiProperty({ type: UnidadeMedida })
    override data?: UnidadeMedida;
}
export class ObterListaUnidadeMedida {
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
        type: UnidadeMedida,
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
        type: UnidadeMedida, isArray: true
    })
    @ApiOperation({
        operationId: 'UnidadeMedidaGet'
    })
    override async GetList(
        @Body() input: ObterListaUnidadeMedida,
    ) {
        return super.GetList(input);
    }
}