import { Body, Controller, Post } from "@nestjs/common";
import { InformacaoContatoService } from "../service/informacao-contato.service";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/core";
import { InformacaoContato } from "../model/informacao-contato.entity";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
export class SyncPayloadDaoInformacaoContato extends SyncPayloadDao<InformacaoContato> {
    @ApiProperty({ type: InformacaoContato })
    override data?: InformacaoContato;
}
export class ObterListaInformacaoContato {
    // override data?: InformacaoContato;
    @ApiProperty({})
    skip?: number;
    @ApiProperty({})
    take?: number;
    @ApiProperty({})
    where?: FindOptionsWhere<InformacaoContato>[] | FindOptionsWhere<InformacaoContato>;
}
export class InformacaoContatoCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
/**
 * InformacaoContato Controller
 * 
 * 
 */
@ApiTags('InformacaoContato')
@Controller('InformacaoContato')
export class InformacaoContatoController extends ControllerDaoBase<InformacaoContatoService, InformacaoContato> {
    @Post('Sync')
    @ApiResponse({
        type:
            SyncPayloadDaoInformacaoContato
    })
    @ApiOperation({
        operationId: 'SyncInformacaoContato'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoInformacaoContato,
    ) {
        return await super.Sync(body)
    }
    @Post('GetList')
    @ApiResponse({
        type:
            SyncPayloadDaoInformacaoContato
    })
    @ApiOperation({
        operationId: 'GetListInformacaoContato'
    })
    override async GetList(
        @Body() input: ObterListaInformacaoContato,
    ) {
        return super.GetList(input);
    }
}