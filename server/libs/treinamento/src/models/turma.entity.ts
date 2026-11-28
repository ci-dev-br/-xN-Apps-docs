import { Column, Entity, ManyToOne } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/manager";
import { schema } from "./schema";
import { Curso } from "./curso.entity";

/**
 * Turma (Sessão / Evento) associada a um Curso.
 * Baseado em /docs/terinamento.md.
 */
@Entity({ schema })
export class Turma extends FullAuditedEntity {
    @ApiProperty({ title: 'Nome da Turma', description: 'Identificação da turma (ex: Turma Novembro 2026)', nullable: true, required: false })
    @Column({ nullable: true, length: 160 })
    nome?: string;

    @ApiProperty({ title: 'Data de Início', description: 'Data e hora de início', type: 'Date', nullable: true, required: false })
    @Column({ nullable: true })
    dataInicio?: Date;

    @ApiProperty({ title: 'Data de Fim', description: 'Data e hora de término', type: 'Date', nullable: true, required: false })
    @Column({ nullable: true })
    dataFim?: Date;

    @ApiProperty({ title: 'Local ou Link', description: 'Endereço físico ou link da sala virtual', nullable: true, required: false })
    @Column({ nullable: true })
    localOuLink?: string;

    @ApiProperty({ title: 'Vagas Disponíveis', description: 'Quantidade de vagas abertas', type: 'integer', nullable: true, required: false })
    @Column({ nullable: true, type: 'int', default: 30 })
    vagasDisponiveis?: number;

    @ApiProperty({ title: 'Status', description: 'Estado da turma (Planejada, Aberta, Em Andamento, Concluída, Cancelada)', nullable: true, required: false })
    @Column({ nullable: true, length: 40, default: 'Aberta' })
    status?: string;

    @ApiProperty({ title: 'ID do Curso', description: 'Identificador interno do curso associado', nullable: true, required: false })
    @Column({ nullable: true })
    cursoId?: string;

    @ApiProperty({ title: 'Curso', description: 'Curso vinculado à turma', type: () => Curso, nullable: true, required: false })
    @ManyToOne(() => Curso, curso => curso.turmas, { nullable: true, onDelete: 'CASCADE' })
    curso?: Curso;
}
