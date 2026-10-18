import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FindOptionsWhere } from "typeorm";
import { ControllerDaoBase, SyncPayloadDao } from "@ci/manager";
import { DocumentoIdentificacao } from "../model/documento-identificacao.entity";
import { DocumentoIdentificacaoService } from "../service/documento-identificacao.service";
import { GetByInternalIdInputDto } from "./GetByInternalIdInputDto";

export class SyncPayloadDaoDocumentoIdentificacao extends SyncPayloadDao<DocumentoIdentificacao> {
    @ApiProperty({ type: DocumentoIdentificacao })
    override data?: DocumentoIdentificacao;
}

export class ObterListaDocumentoIdentificacao {
    @ApiProperty({ required: false, nullable: true })
    skip?: number;
    @ApiProperty({ required: false, nullable: true })
    take?: number;
    @ApiProperty({ required: false, nullable: true, type: DocumentoIdentificacao })
    where?: FindOptionsWhere<DocumentoIdentificacao>[] | FindOptionsWhere<DocumentoIdentificacao>;
    @ApiProperty({ required: false, nullable: true, type: DocumentoIdentificacao })
    filter?: Partial<DocumentoIdentificacao>;
    @ApiProperty({ required: false, nullable: true })
    search?: string;
    @ApiProperty({ required: false, nullable: true })
    orderBy?: Record<string, 'ASC' | 'DESC'>;
}

@ApiTags('DocumentoIdentificacao')
@Controller('DocumentoIdentificacao')
export class DocumentoIdentificacaoController extends ControllerDaoBase<DocumentoIdentificacaoService, DocumentoIdentificacao> {
    constructor(
        service: DocumentoIdentificacaoService
    ) {
        super(service);
    }

    @Post('Sync')
    @ApiResponse({
        type: SyncPayloadDaoDocumentoIdentificacao
    })
    @ApiOperation({
        operationId: 'SyncDocumentoIdentificacao'
    })
    override async Sync(
        @Body() body: SyncPayloadDaoDocumentoIdentificacao,
        @Req() req?: any,
    ) {
        return await super.Sync(body, req);
    }

    @Post('GetByInternalId')
    @ApiResponse({
        type: DocumentoIdentificacao,
    })
    @ApiOperation({
        operationId: 'GetByInternalIdDocumentoIdentificacao',
    })
    override async GetByInternalId(
        @Body() input: GetByInternalIdInputDto,
        @Req() req?: any,
    ) {
        return await super.GetByInternalId(input, req);
    }

    @Post('GetList')
    @ApiResponse({
        type: SyncPayloadDaoDocumentoIdentificacao
    })
    @ApiOperation({
        operationId: 'GetListDocumentoIdentificacao'
    })
    override async GetList(
        @Body() input: ObterListaDocumentoIdentificacao,
        @Req() req?: any,
    ) {
        return super.GetList(input, req);
    }

    @Post('Delete')
    @ApiResponse({
        type: DocumentoIdentificacao
    })
    @ApiOperation({
        operationId: 'DeleteDocumentoIdentificacao'
    })
    override async Delete(
        @Body() body: DocumentoIdentificacao,
        @Req() req?: any,
    ) {
        return await super.Delete(body, req);
    }
}
