import { Column, Entity, ManyToOne } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/manager";
import { schema } from "./schema";
import { Curso } from "./curso.entity";
import { Turma } from "./turma.entity";

/**
 * Matrícula e acompanhamento de progresso do Aluno em um Curso/Turma.
 * Baseado em /docs/terinamento.md.
 */
@Entity({ schema })
export class Matricula extends FullAuditedEntity {
    @ApiProperty({ title: 'Nome do Aluno', description: 'Nome do colaborador/aluno matriculado', nullable: true, required: false })
    @Column({ nullable: true, length: 160 })
    alunoNome?: string;

    @ApiProperty({ title: 'E-mail do Aluno', description: 'E-mail do aluno matriculado', nullable: true, required: false })
    @Column({ nullable: true, length: 180 })
    alunoEmail?: string;

    @ApiProperty({ title: 'ID do Usuário Aluno', description: 'Identificador do usuário matriculado', nullable: true, required: false })
    @Column({ nullable: true })
    userId?: string;

    @ApiProperty({ title: 'Status', description: 'Status da matrícula (Pendente, Confirmada, Cancelada)', nullable: true, required: false })
    @Column({ nullable: true, length: 40, default: 'Confirmada' })
    status?: string;

    @ApiProperty({ title: 'Presença Confirmada', description: 'Indica confirmação de presença na turma', type: 'boolean', nullable: true, required: false })
    @Column({ nullable: true, default: true })
    presencaConfirmada?: boolean;

    @ApiProperty({ title: 'Progresso (%)', description: 'Percentual de conclusão do curso (0-100)', type: 'integer', nullable: true, required: false })
    @Column({ nullable: true, type: 'int', default: 0 })
    progresso?: number;

    @ApiProperty({ title: 'Aulas Concluídas', description: 'Lista de internalIds de aulas concluídas', type: String, isArray: true, nullable: true, required: false })
    @Column({ nullable: true, type: 'jsonb', default: [] })
    aulasConcluidasIds?: string[];

    @ApiProperty({ title: 'Último Tempo por Aula', description: 'Mapa aulaId -> segundos assistidos para retomada do player', nullable: true, required: false })
    @Column({ nullable: true, type: 'jsonb', default: {} })
    ultimoTempoPorAula?: Record<string, number>;

    @ApiProperty({ title: 'Última Aula Acessada', description: 'ID da última aula assistida', nullable: true, required: false })
    @Column({ nullable: true })
    ultimaAulaId?: string;

    @ApiProperty({ title: 'Código do Certificado', description: 'Hash de autenticidade do certificado emitido', nullable: true, required: false })
    @Column({ nullable: true })
    certificadoCodigo?: string;

    @ApiProperty({ title: 'Data de Emissão do Certificado', description: 'Data em que o certificado foi emitido', nullable: true, required: false })
    @Column({ nullable: true })
    certificadoEmitidoEm?: string;

    @ApiProperty({ title: 'ID do Curso', description: 'Identificador do curso matriculado', nullable: true, required: false })
    @Column({ nullable: true })
    cursoId?: string;

    @ApiProperty({ title: 'Curso', description: 'Curso matriculado', type: () => Curso, nullable: true, required: false })
    @ManyToOne(() => Curso, { nullable: true, onDelete: 'CASCADE' })
    curso?: Curso;

    @ApiProperty({ title: 'Turma', description: 'Turma associada à matrícula', type: () => Turma, nullable: true, required: false })
    @ManyToOne(() => Turma, { nullable: true })
    turma?: Turma;
}
