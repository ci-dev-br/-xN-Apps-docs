import { Column, Entity, ManyToOne } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Website } from "./website.entity";
import { SiteMediaType } from "./cms-enums";

/**
 * Biblioteca de Mídias do CMS (imagens, PDFs, vídeos e documentos)
 */
@Entity({ schema })
export class SiteMedia extends FullAuditedEntity {
    @ApiProperty({
        title: 'Nome do Arquivo',
        description: 'Nome do arquivo de mídia',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    filename?: string;

    @ApiProperty({
        title: 'URL',
        description: 'Endereço público ou caminho do arquivo de mídia',
        format: 'url',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    url?: string;

    @ApiProperty({
        title: 'Tipo de Mídia',
        description: 'Categoria do arquivo (image, pdf, video, audio, document)',
        enum: SiteMediaType,
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, default: SiteMediaType.IMAGE })
    mediaType?: string;

    @ApiProperty({
        title: 'MIME Type',
        description: 'Tipo MIME do arquivo (ex: image/png, application/pdf)',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    mimeType?: string;

    @ApiProperty({
        title: 'Tamanho (bytes)',
        description: 'Tamanho do arquivo em bytes',
        type: 'integer',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, type: 'int8' })
    sizeBytes?: number;

    @ApiProperty({
        title: 'Tamanho Formatado',
        description: 'Representação legível do tamanho (ex: 1.2 MB)',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    sizeLabel?: string;

    @ApiProperty({
        title: 'Texto Alternativo',
        description: 'Texto alternativo para acessibilidade e SEO',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    altText?: string;

    @ApiProperty({
        title: 'Descrição',
        description: 'Legenda ou notas sobre o arquivo',
        format: 'textarea',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, type: 'text' })
    description?: string;

    @ApiProperty({
        title: 'Website',
        description: 'Website associado ao arquivo de mídia',
        type: () => Website,
        nullable: true,
        required: false,
    })
    @ManyToOne(() => Website)
    website?: Website;
}
