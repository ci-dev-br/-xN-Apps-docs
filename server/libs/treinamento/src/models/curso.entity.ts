import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/manager";
import { schema } from "./schema";
import { Instrutor } from "./instrutor.entity";
import { Aula } from "./aula.entity";
import { Turma } from "./turma.entity";

/**
 * Curso (Treinamento) disponível no catálogo corporativo ou criado no painel do instrutor.
 * Baseado em /docs/terinamento.md.
 */
@Entity({ schema })
export class Curso extends FullAuditedEntity {
    @ApiProperty({ title: 'Título', description: 'Título do treinamento', nullable: true, required: false })
    @Column({ nullable: true, length: 200 })
    titulo?: string;

    @ApiProperty({ title: 'Descrição', description: 'Resumo de apresentação do curso', format: 'textarea', nullable: true, required: false })
    @Column({ nullable: true, type: 'text' })
    descricao?: string;

    @ApiProperty({ title: 'Ementa', description: 'Conteúdo programático e objetivos pedagógicos', format: 'textarea', nullable: true, required: false })
    @Column({ nullable: true, type: 'text' })
    ementa?: string;

    @ApiProperty({ title: 'Carga Horária (h)', description: 'Carga horária total em horas', type: 'integer', nullable: true, required: false })
    @Column({ nullable: true, type: 'int', default: 1 })
    cargaHoraria?: number;

    @ApiProperty({ title: 'Preço Base', description: 'Valor base do treinamento', type: 'number', nullable: true, required: false })
    @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2, default: 0 })
    precoBase?: number;

    @ApiProperty({ title: 'Trilha', description: 'Trilha de conhecimento do treinamento', nullable: true, required: false })
    @Column({ nullable: true, length: 120, default: 'Tecnologia & Dev' })
    trilha?: string;

    @ApiProperty({ title: 'Nível', description: 'Nível de dificuldade (Iniciante, Intermediário, Avançado)', nullable: true, required: false })
    @Column({ nullable: true, length: 40, default: 'Iniciante' })
    nivel?: string;

    @ApiProperty({ title: 'Ícone', description: 'Nome do ícone Material exibido no card', nullable: true, required: false })
    @Column({ nullable: true, length: 64, default: 'school' })
    icone?: string;

    @ApiProperty({ title: 'Cor da Capa', description: 'Cor hexadecimal de destaque do card', nullable: true, required: false })
    @Column({ nullable: true, length: 24, default: '#2563eb' })
    corCapa?: string;

    @ApiProperty({ title: 'Publicado', description: 'Indica se o treinamento está visível para alunos', type: 'boolean', nullable: true, required: false })
    @Column({ nullable: true, default: true })
    publicado?: boolean;

    @ApiProperty({ title: 'Avaliação', description: 'Nota média do treinamento', type: 'number', nullable: true, required: false })
    @Column({ nullable: true, type: 'float', default: 5.0 })
    rating?: number;

    @ApiProperty({ title: 'Nome do Instrutor', description: 'Nome de exibição do instrutor', nullable: true, required: false })
    @Column({ nullable: true, length: 160 })
    instrutorNome?: string;

    @ApiProperty({ title: 'ID do Usuário Instrutor', description: 'Identificador do usuário criador/instrutor', nullable: true, required: false })
    @Column({ nullable: true })
    instrutorUserId?: string;

    @ApiProperty({ title: 'Instrutor', description: 'Instrutor responsável pelo treinamento', type: () => Instrutor, nullable: true, required: false })
    @ManyToOne(() => Instrutor, { nullable: true })
    instrutor?: Instrutor;

    @ApiProperty({ title: 'Aulas', description: 'Lista de aulas em vídeo e materiais do curso', type: () => Aula, isArray: true, nullable: true, required: false })
    @OneToMany(() => Aula, aula => aula.curso)
    aulas?: Aula[];

    @ApiProperty({ title: 'Turmas', description: 'Turmas e sessões agendadas para o curso', type: () => Turma, isArray: true, nullable: true, required: false })
    @OneToMany(() => Turma, turma => turma.curso)
    turmas?: Turma[];
}
