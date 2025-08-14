import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/core";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { DocumentoFiscalAnexo } from "./documento-fiscal-anexo.entity";
import { schema } from "./schema";

/***
 * Documento Fiscal - Registro de documento fiscal
 * 
 * O documento fiscal permite registrar documentos vincular a emissão de 
 * taxas existentes. 
 */
@Entity({ schema })
export class DocumentoFiscal extends FullAuditedEntity {
    @ApiProperty({ nullable: true }) @Column({ nullable: true })
    title?: string;
    @ApiProperty({ nullable: true }) @Column({ nullable: true })
    description?: string;
    @ApiProperty({ nullable: true }) @Column({ nullable: true, length: 2048 })
    hash?: string;
    @ManyToMany(() => DocumentoFiscalAnexo)
    attachements?: DocumentoFiscalAnexo[];
}