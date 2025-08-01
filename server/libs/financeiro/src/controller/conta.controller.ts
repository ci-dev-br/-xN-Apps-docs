 import { Body, Controller, Post } from "@nestjs/common";
import { ContaService } from "../service/conta.service";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/core";
import { ContaFinanceira } from "../model/conta-financeira.entity";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
export class SyncPayloadDaoConta extends SyncPayloadDao<ContaFinanceira> {
    @ApiProperty({ type: ContaFinanceira })
    override data?: ContaFinanceira;
}
export class ObterListaConta {
    // override data?: Conta;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<ContaFinanceira>[] | FindOptionsWhere<ContaFinanceira>;
}
export class ContaCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
/**
 * Conta Controller
 */
@ApiTags('Conta')
@Controller('Conta')
export class ContaController extends ControllerDaoBase<ContaService, ContaFinanceira> {
    @Post('Sync')
    @ApiResponse({
        type: SyncPayloadDaoConta
    })
    @ApiOperation({
        operationId: 'SyncConta'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoConta,
    ) {
        return await super.Sync(body)
    }
    @Post('GetList')
    @ApiResponse({
        type:
            SyncPayloadDaoConta
    })
    @ApiOperation({
        operationId: 'GetListConta'
    })
    override async GetList(
        @Body() input: ObterListaConta,
    ) {
        return super.GetList(input);
    }
}