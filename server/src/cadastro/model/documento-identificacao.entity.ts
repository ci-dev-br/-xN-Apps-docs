import { FullAuditedEntity } from "src/core/dao";
import { Entity, ManyToMany } from "typeorm";
import { TipoDocumentoIdentificacao } from "./tipo-documento-identificacao.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ schema: 'cadastro' })
export class DocumentoIdentificacao extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false })
    @ManyToMany(() => TipoDocumentoIdentificacao)
    tipo?: TipoDocumentoIdentificacao;
}