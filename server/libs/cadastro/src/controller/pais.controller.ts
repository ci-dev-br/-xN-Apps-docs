import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Pais } from "../model/pais.entity";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { PaisService } from "../service/pais.service";
export class SyncPayloadDaoPais extends SyncPayloadDao<Pais> {
    @ApiProperty({ type: Pais })
    override data?: Pais;
}
export class ObterListaPais {
    // override data?: Pais;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<Pais>[] | FindOptionsWhere<Pais>;
}
export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
@ApiTags('Pais')
@Controller('Pais')
export class PaisController extends ControllerDaoBase<PaisService, Pais> {
    constructor(
        service: PaisService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: Pais,
    })
    @ApiOperation({
        operationId: 'PaisSync'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoPais,
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
    @Post('Get')
    @ApiResponse({
        type: Pais, isArray: true
    })
    @ApiOperation({
        operationId: 'PaisGet'
    })
    override async GetList(
        @Body() input: ObterListaPais,
    ) {
        return super.GetList(input);
    }
}