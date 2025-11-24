import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { schema } from "./schema";
import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/manager";
import { Termos } from "../termos";
import { ClienteProjeto } from "./cliente-projeto.entity";
import { ProjetoVisibilidade } from "./visibilidade.enum";
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
    @Column({ nullable: true, enum: ProjetoVisibilidade, })
    visibilidade?: ProjetoVisibilidade;
    @ApiProperty({
        description: Termos.Projeto.ControleVersão.Descrição,
        nullable: true, required: false
    })
    @Column({ nullable: true })
    controleVersao?: string;
    @ApiProperty({
        nullable: true, type: ClienteProjeto,
        description: Termos.Projeto.Cliente.Descrição,
    })
    @ManyToMany(t => ClienteProjeto) @JoinTable()
    cliente?: ClienteProjeto;
    @ApiProperty({
        nullable: true, required: false,
        description: Termos.Projeto.dataInicio.Descrição,
    })
    @Column({ nullable: true })
    dataInicio?: Date;
} 