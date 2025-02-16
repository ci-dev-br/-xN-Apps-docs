import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { schema } from "./schema";
import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/manager";
import { Termos } from "../termos";
import { Cliente } from "./cliente.entity";
/**
 * Projetos
 */
@Entity({
    schema
})
export class Projeto extends FullAuditedEntity {
    @ApiProperty({
        nullable: true, required: false,
        description: Termos.Projeto.nome.Descrição,
    })
    @Column({ nullable: true })
    nome?: string;
    @ApiProperty({
        nullable: true, required: false,
        description: Termos.Projeto.descricao.Descrição,
    })
    @Column({ nullable: true })
    descricao?: string;
    @ApiProperty({
        nullable: true, required: false,
        description: Termos.Projeto.visibilidade.Descrição,
    })
    @Column({ nullable: true, enum: ['Visível', 'Invisível'] })
    visibilidade?: string;
    @ApiProperty({
        description: Termos.Projeto.ControleVersão.Descrição,
        nullable: true, required: false
    })
    @Column({ nullable: true })
    controleVersao?: string;
    @ApiProperty({
        nullable: true, type: Cliente,
        description: Termos.Projeto.Cliente.Descrição,
    })
    @ManyToMany(t => Cliente) @JoinTable()
    cliente?: Cliente;
} 