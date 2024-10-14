import { Column, Entity, ManyToMany } from "typeorm";
import { schema } from "../termos";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Organizacao } from "./organizacao.entity";

/**
 * # Setor da Organização
 */
@Entity({ schema })
export class Setor extends FullAuditedEntity {
    /**
     * # Name of Setor
     */
    @ApiProperty({
        title: '',
        description: '',
        // externalDocs: { url: },
    }) @Column({ nullable: true }) name?: string;

    /**
     * # Organização
     */
    @ApiProperty({
        title: '',
        description: '',
        // externalDocs: { url: },
    }) @ManyToMany(type => Organizacao) organizacao?: Organizacao;
}