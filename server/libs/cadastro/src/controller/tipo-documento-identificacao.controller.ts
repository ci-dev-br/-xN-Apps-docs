import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { TipoDocumentoIdentificacao } from "../model/tipo-documento-identificacao.entity";
import { TipoDocumentoIdentificacaoService } from "../service/tipo-documento-identificacao.service";
import { GetByInternalIdInputDto } from "./GetByInternalIdInputDto";

export class SyncPayloadDaoTipoDocumentoIdentificacao extends SyncPayloadDao<TipoDocumentoIdentificacao> {
    @ApiProperty({ type: TipoDocumentoIdentificacao })
    override data?: TipoDocumentoIdentificacao;
}

export class ObterListaTipoDocumentoIdentificacao {
    @ApiProperty({ required: false, nullable: true })
    skip?: number;
    @ApiProperty({ required: false, nullable: true })
    take?: number;
    @ApiProperty({ required: false, nullable: true, type: TipoDocumentoIdentificacao })
    where?: FindOptionsWhere<TipoDocumentoIdentificacao>[] | FindOptionsWhere<TipoDocumentoIdentificacao>;
    @ApiProperty({ required: false, nullable: true, type: TipoDocumentoIdentificacao })
    filter?: Partial<TipoDocumentoIdentificacao>;
    @ApiProperty({ required: false, nullable: true })
    search?: string;
    @ApiProperty({ required: false, nullable: true })
    orderBy?: Record<string, 'ASC' | 'DESC'>;
}

@ApiTags('TipoDocumentoIdentificacao')
@Controller('TipoDocumentoIdentificacao')
export class TipoDocumentoIdentificacaoController extends ControllerDaoBase<TipoDocumentoIdentificacaoService, TipoDocumentoIdentificacao> {
    constructor(
        service: TipoDocumentoIdentificacaoService
    ) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({
        type: SyncPayloadDaoTipoDocumentoIdentificacao
    })
    @ApiOperation({
        operationId: 'SyncTipoDocumentoIdentificacao'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoTipoDocumentoIdentificacao,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({
        type: TipoDocumentoIdentificacao,
    })
    @ApiOperation({
        operationId: 'GetByInternalIdTipoDocumentoIdentificacao',
    })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({
        type: SyncPayloadDaoTipoDocumentoIdentificacao
    })
    @ApiOperation({
        operationId: 'GetListTipoDocumentoIdentificacao'
    })
    override async GetList(
        @Body() input: ObterListaTipoDocumentoIdentificacao,
        @Req() req?: any,
    ) {
        return super.GetList(input, req);
    }

    @Post('Delete')
    @ApiResponse({
        type: TipoDocumentoIdentificacao
    })
    @ApiOperation({
        operationId: 'DeleteTipoDocumentoIdentificacao'
    })
    override async Delete(
        @Body() body: TipoDocumentoIdentificacao,
        @Req() req?: any,
    ) {
        return await super.Delete(body, req);
    }
}
