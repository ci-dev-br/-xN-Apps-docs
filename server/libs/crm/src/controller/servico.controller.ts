import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Servico } from "../models/servico";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { ServicoService } from "../service/servico.service";
export class SyncPayloadDaoServico extends SyncPayloadDao<Servico> {
    @ApiProperty({ type: Servico })
    override data?: Servico;
}
export class ObterListaServico {
    // override data?: Servico;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<Servico>[] | FindOptionsWhere<Servico>;
}
export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
@ApiTags('Servico')
@Controller('Servico')
export class ServicoController extends ControllerDaoBase<ServicoService, Servico> {
    constructor(
        service: ServicoService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: Servico,
    })
    @ApiOperation({
        operationId: 'SyncServico'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoServico,
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
        type: Servico, isArray: true
    })
    @ApiOperation({
        operationId: 'GetListServico'
    })
    override async GetList(
        @Body() input: ObterListaServico,
    ) {
        return super.GetList(input);
    }
}