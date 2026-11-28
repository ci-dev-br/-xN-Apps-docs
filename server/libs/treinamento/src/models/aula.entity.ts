import { Column, Entity, ManyToOne } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/manager";
import { schema } from "./schema";
import { Curso } from "./curso.entity";

export class MaterialApoioItem {
    @ApiProperty({ title: 'ID do Ativo no Storage', required: false, nullable: true })
    assetId?: string;

    @ApiProperty({ title: 'Nome do Arquivo', required: false, nullable: true })
    nome?: string;

    @ApiProperty({ title: 'MIME Type', required: false, nullable: true })
    mimeType?: string;

    @ApiProperty({ title: 'Tamanho (bytes)', required: false, nullable: true })
    sizeBytes?: number;

    @ApiProperty({ title: 'Descrição', required: false, nullable: true })
    descricao?: string;

    @ApiProperty({ title: 'Data de Adição', required: false, nullable: true })
    adicionadoEm?: string;
}

/**
 * Aula pertencente a um Curso, vinculada a um vídeo processado via FFmpeg
 * no serviço de Storage e materiais de apoio para download/estudo.
 */
@Entity({ schema })
export class Aula extends FullAuditedEntity {
    @ApiProperty({ title: 'Título da Aula', description: 'Título da aula', nullable: true, required: false })
    @Column({ nullable: true, length: 200 })
    titulo?: string;

    @ApiProperty({ title: 'Descrição / Resumo', description: 'Resumo e orientações da aula', format: 'textarea', nullable: true, required: false })
    @Column({ nullable: true, type: 'text' })
    descricao?: string;

    @ApiProperty({ title: 'Ordem', description: 'Posição sequencial da aula no curso', type: 'integer', nullable: true, required: false })
    @Column({ nullable: true, type: 'int', default: 1 })
    ordem?: number;

    @ApiProperty({ title: 'Duração (segundos)', description: 'Duração total em segundos obtida via ffprobe/ffmpeg', type: 'number', nullable: true, required: false })
    @Column({ nullable: true, type: 'float', default: 0 })
    duracaoSegundos?: number;

    @ApiProperty({ title: 'Duração', description: 'Duração formatada (MM:SS)', nullable: true, required: false })
    @Column({ nullable: true, length: 24, default: '00:00' })
    duracaoLabel?: string;

    @ApiProperty({ title: 'ID do Vídeo no Storage', description: 'internalId do StorageAsset correspondente ao vídeo da aula', nullable: true, required: false })
    @Column({ nullable: true })
    videoAssetId?: string;

    @ApiProperty({ title: 'Nome do Arquivo de Vídeo', description: 'Nome do arquivo de vídeo armazenado', nullable: true, required: false })
    @Column({ nullable: true })
    videoFileName?: string;

    @ApiProperty({ title: 'Miniatura do Vídeo', description: 'Data URL da miniatura gerada pelo FFmpeg', nullable: true, required: false })
    @Column({ nullable: true, type: 'text' })
    thumbnailDataUrl?: string;

    @ApiProperty({ title: 'Metadados do Vídeo', description: 'Metadados técnicos extraídos via FFmpeg (resolução, codecs, tamanho)', nullable: true, required: false })
    @Column({ nullable: true, type: 'jsonb' })
    videoMetadata?: any;

    @ApiProperty({ title: 'Materiais de Apoio', description: 'Lista de materiais de apoio armazenados no Storage', type: MaterialApoioItem, isArray: true, nullable: true, required: false })
    @Column({ nullable: true, type: 'jsonb', default: [] })
    materiaisApoio?: MaterialApoioItem[];

    @ApiProperty({ title: 'ID do Curso', description: 'Identificador interno do curso pai', nullable: true, required: false })
    @Column({ nullable: true })
    cursoId?: string;

    @ApiProperty({ title: 'Curso', description: 'Curso ao qual a aula pertence', type: () => Curso, nullable: true, required: false })
    @ManyToOne(() => Curso, curso => curso.aulas, { nullable: true, onDelete: 'CASCADE' })
    curso?: Curso;
}
