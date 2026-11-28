import { Column, Entity } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/manager";
import { schema } from "./schema";

/**
 * Anotação de estudo realizada pelo aluno no aplicativo Estudos,
 * podendo ser vinculada a um Curso, Aula e timestamp exato do vídeo.
 */
@Entity({ schema })
export class AnotacaoEstudo extends FullAuditedEntity {
    @ApiProperty({ title: 'Título', description: 'Título da anotação ou resumo', nullable: true, required: false })
    @Column({ nullable: true, length: 200 })
    titulo?: string;

    @ApiProperty({ title: 'Disciplina / Tema', description: 'Assunto ou trilha da anotação', nullable: true, required: false })
    @Column({ nullable: true, length: 120, default: 'Geral' })
    disciplina?: string;

    @ApiProperty({ title: 'Conteúdo', description: 'Texto completo, código ou resumo da aula', format: 'textarea', nullable: true, required: false })
    @Column({ nullable: true, type: 'text' })
    conteudo?: string;

    @ApiProperty({ title: 'Tags', description: 'Palavras-chave da anotação', type: String, isArray: true, nullable: true, required: false })
    @Column({ nullable: true, type: 'jsonb', default: [] })
    tags?: string[];

    @ApiProperty({ title: 'ID do Curso', description: 'Identificador do curso relacionado', nullable: true, required: false })
    @Column({ nullable: true })
    cursoId?: string;

    @ApiProperty({ title: 'Título do Curso', description: 'Nome do curso para exibição rápida', nullable: true, required: false })
    @Column({ nullable: true })
    cursoTitulo?: string;

    @ApiProperty({ title: 'ID da Aula', description: 'Identificador da aula relacionada', nullable: true, required: false })
    @Column({ nullable: true })
    aulaId?: string;

    @ApiProperty({ title: 'Título da Aula', description: 'Nome da aula para exibição rápida', nullable: true, required: false })
    @Column({ nullable: true })
    aulaTitulo?: string;

    @ApiProperty({ title: 'Minutagem (segundos)', description: 'Posição exata do vídeo em segundos quando a anotação foi feita', type: 'number', nullable: true, required: false })
    @Column({ nullable: true, type: 'float' })
    timestampSegundos?: number;

    @ApiProperty({ title: 'Minutagem Formatada', description: 'Tempo formatado no vídeo (ex: 04:15)', nullable: true, required: false })
    @Column({ nullable: true, length: 24 })
    timestampLabel?: string;

    @ApiProperty({ title: 'ID do Usuário', description: 'Autor da anotação', nullable: true, required: false })
    @Column({ nullable: true })
    userId?: string;
}
