import { FullAuditedEntity } from "@ci/core";
import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { TipoDocumentoIdentificacao } from "./tipo-documento-identificacao.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Pessoa } from "./pessoa.entity";
import { schema } from "./schema";
/**
 * Documento de Identificação
 */
@Entity({ schema, })
export class DocumentoIdentificacao extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false, type: TipoDocumentoIdentificacao })
    @ManyToMany(() => TipoDocumentoIdentificacao)
    tipo?: TipoDocumentoIdentificacao;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: false })
    numeroDocumento?: string;
    @ApiProperty({ nullable: true, required: false, type: Pessoa })
    @ManyToOne(type => Pessoa, pessoa => pessoa.documentos)
    pessoa?: Pessoa;
}