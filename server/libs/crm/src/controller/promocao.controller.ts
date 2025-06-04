import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Promocao } from "../models/promocao";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { PromocaoService } from "../service/promocao.service";
export class SyncPayloadDaoPromocao extends SyncPayloadDao<Promocao> {
    @ApiProperty({ type: Promocao })
    override data?: Promocao;
}
export class ObterListaPromocao {
    // override data?: Promocao;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<Promocao>[] | FindOptionsWhere<Promocao>;
}
export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
@ApiTags('Promocao')
@Controller('Promocao')
export class PromocaoController extends ControllerDaoBase<PromocaoService, Promocao> {
    constructor(
        service: PromocaoService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: Promocao,
    })
    @ApiOperation({
        operationId: 'SyncPromocao'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoPromocao,
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
    @Post('GetList')
    @ApiResponse({
        type: Promocao, isArray: true
    })
    @ApiOperation({
        operationId: 'GetListPromocao'
    })
    override async GetList(
        @Body() input: ObterListaPromocao,
    ) {
        return super.GetList(input);
    }
}