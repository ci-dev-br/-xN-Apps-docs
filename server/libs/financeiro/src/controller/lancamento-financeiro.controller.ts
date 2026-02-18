import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { FindOptionsWhere } from "typeorm";
import { LancamentoFinanceiroService } from "../service/lancamento-financeiro.service";
import { LancamentoFinanceiro } from "../model/lancamento-financeiro.entity";
export class SyncPayloadDaoLancamentoFinanceiro extends SyncPayloadDao<LancamentoFinanceiro> {
    @ApiProperty({ type: LancamentoFinanceiro })
    override data?: LancamentoFinanceiro;
}
export class ObterListaLancamentoFinanceiro {
    // override data?: LancamentoFinanceiro;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<LancamentoFinanceiro>[] | FindOptionsWhere<LancamentoFinanceiro>;
}
export class PessoaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
@ApiTags('LancamentoFinanceiro')
@Controller('LancamentoFinanceiro')
export class LancamentoFinanceiroController extends ControllerDaoBase<LancamentoFinanceiroService, LancamentoFinanceiro> {
    constructor(
        service: LancamentoFinanceiroService
    ) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: LancamentoFinanceiro,
    })
    @ApiOperation({
        operationId: 'SyncLancamentoFinanceiro'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoLancamentoFinanceiro,
        @Req() req,
    ) {
        try {
            return await super.Sync(body, req)
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
        type: LancamentoFinanceiro, isArray: true
    })
    @ApiOperation({
        operationId: 'GetListLancamentoFinanceiro'
    })
    override async GetList(
        @Body() input: ObterListaLancamentoFinanceiro,
        @Req() req,
    ) {
        return super.GetList(input, req);
    }
}