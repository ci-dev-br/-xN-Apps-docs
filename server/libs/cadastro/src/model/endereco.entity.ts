import { FullAuditedEntity } from "@ci/core";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity } from "typeorm";
import { schema } from "./schema";
/**
 * Endereço 
 */
@Entity({ schema })
export class Endereco extends FullAuditedEntity {
    /**
     * Logradouro
     */
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true }) logradouro?: string;
    /**
     * Endereço
     */
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true }) address?: string;
    /**
     * Número
     */
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true }) addressNumber?: string;
    /**
     * Complemento
     */
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true }) complement?: string;
    /**
     * Bairro
     */
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true }) province?: string;
}