import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Atendimento } from "../models/atendimento";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { AtendimentoService } from "../service/atendimento.service";
export class SyncPayloadDaoAtendimento extends SyncPayloadDao<Atendimento> {
    @ApiProperty({ type: Atendimento })
    override data?: Atendimento;
}
export class ObterListaAtendimento {
    // override data?: Atendimento;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<Atendimento>[] | FindOptionsWhere<Atendimento>;
}
export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
@ApiTags('Atendimento')
@Controller('Atendimento')
export class AtendimentoController extends ControllerDaoBase<AtendimentoService, Atendimento> {
    constructor(
        service: AtendimentoService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: Atendimento,
    })
    @ApiOperation({
        operationId: 'SyncAtendimento'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoAtendimento,
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
        type: Atendimento, isArray: true
    })
    @ApiOperation({
        operationId: 'GetListAtendimento'
    })
    override async GetList(
        @Body() input: ObterListaAtendimento,
    ) {
        return super.GetList(input);
    }
}