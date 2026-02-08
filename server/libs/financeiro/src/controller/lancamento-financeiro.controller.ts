import { Body, Controller, Post, Req } from "@nestjs/common";
import { LancamentoFinanceiroService } from "../service/lancamento-financeiro.service";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/core";
import {
    LancamentoFinanceiro

} from "../model/lancamento-financeiro.entity";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
export class SyncPayloadDaoLancamentoFinanceiro extends SyncPayloadDao<LancamentoFinanceiro
> {
    @ApiProperty({
        type: LancamentoFinanceiro

    })
    override data?: LancamentoFinanceiro
        ;
}
export class ObterListaLancamentoFinanceiro {
    // override data?: LancamentoFinanceiro;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<LancamentoFinanceiro
    >[] | FindOptionsWhere<LancamentoFinanceiro
    >;
}
export class LancamentoFinanceiroCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
/**
 * LancamentoFinanceiro Controller
 */
@ApiTags('LancamentoFinanceiro')
@Controller('LancamentoFinanceiro')
export class LancamentoFinanceiroController extends ControllerDaoBase<LancamentoFinanceiroService, LancamentoFinanceiro
> {
    constructor(service: LancamentoFinanceiroService) {
        super(service);
    }
    @Post('Sync')
    @ApiResponse({
        type: SyncPayloadDaoLancamentoFinanceiro
    })
    @ApiOperation({
        operationId: 'SyncLancamentoFinanceiro'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoLancamentoFinanceiro,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }
    @Post('GetList')
    @ApiResponse({
        type:
            SyncPayloadDaoLancamentoFinanceiro
    })
    @ApiOperation({
        operationId: 'GetListLancamentoFinanceiro'
    })
    override async GetList(
        @Body() input: ObterListaLancamentoFinanceiro,
        @Req() req?: any,
    ) {
        return super.GetList(input, req);
    }
}