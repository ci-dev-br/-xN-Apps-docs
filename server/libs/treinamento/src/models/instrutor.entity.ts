import { Column, Entity } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/manager";
import { schema } from "./schema";

/**
 * Instrutor (Profissional) responsável por criar e ministrar treinamentos.
 * Baseado em /docs/terinamento.md.
 */
@Entity({ schema })
export class Instrutor extends FullAuditedEntity {
    @ApiProperty({ title: 'Nome', description: 'Nome completo do instrutor', nullable: true, required: false })
    @Column({ nullable: true, length: 160 })
    nome?: string;

    @ApiProperty({ title: 'E-mail', description: 'E-mail de contato do instrutor', nullable: true, required: false })
    @Column({ nullable: true, length: 180 })
    email?: string;

    @ApiProperty({ title: 'Telefone', description: 'Telefone de contato', nullable: true, required: false })
    @Column({ nullable: true, length: 40 })
    telefone?: string;

    @ApiProperty({ title: 'Especialidade', description: 'Área principal de atuação do instrutor', nullable: true, required: false })
    @Column({ nullable: true, length: 140 })
    especialidade?: string;

    @ApiProperty({ title: 'Biografia', description: 'Mini currículo e experiência do instrutor', format: 'textarea', nullable: true, required: false })
    @Column({ nullable: true, type: 'text' })
    biografia?: string;

    @ApiProperty({ title: 'Usuário Vinculado', description: 'ID do usuário proprietário deste perfil de instrutor', nullable: true, required: false })
    @Column({ nullable: true })
    userId?: string;
}
