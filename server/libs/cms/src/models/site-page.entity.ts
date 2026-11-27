import { FullAuditedEntity } from "@ci/manager";
import { Column, Entity, ManyToOne } from "typeorm";
import { schema } from "./schema";
import { ApiProperty } from "@nestjs/swagger";
import { Website } from "./website.entity";
import { SiteContentStatus } from "./cms-enums";

/**
 * WebSite Page (Páginas institucionais e rotas dinâmicas servidas pelo CMS)
 */
@Entity({
    schema,
})
export class SitePage extends FullAuditedEntity {
    @ApiProperty({
        title: 'Título',
        description: 'Título da página institucional',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    title?: string;

    @ApiProperty({
        title: 'Slug',
        description: 'Identificador amigável da página',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    slug?: string;

    @ApiProperty({
        title: 'Endereço da página',
        description: 'Endereço público da página (ex: /sobre-nos)',
        nullable: true,
        required: false,
    })
    @Column({
        nullable: true,
    })
    urlMatch?: string;

    @ApiProperty({
        title: 'Template',
        description: 'Nome do template aplicado na renderização da página',
        nullable: true,
        required: false,
    })
    @Column({
        nullable: true,
    })
    tempalte?: string;

    @ApiProperty({
        title: 'Conteúdo HTML',
        format: 'html',
        description: 'Conteúdo HTML da página',
        type: String,
        isArray: true,
        nullable: true,
        required: false,
    })
    @Column({
        nullable: true, array: true, type: 'varchar'
    })
    content?: string[];

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Content-Type',
        description: 'Tipo MIME da resposta HTTP (ex: text/html)',
        maxLength: 120,
    })
    @Column({ nullable: true, length: 120 })
    contentType?: string;

    @ApiProperty({
        title: 'Resumo',
        description: 'Descrição ou resumo SEO da página',
        format: 'textarea',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, type: 'text' })
    excerpt?: string;

    @ApiProperty({
        title: 'Categoria',
        description: 'Categoria ou seção institucional da página',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    category?: string;

    @ApiProperty({
        title: 'Autor',
        description: 'Autor ou departamento responsável',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    author?: string;

    @ApiProperty({
        title: 'Status',
        description: 'Estado de publicação da página',
        enum: SiteContentStatus,
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, default: SiteContentStatus.PUBLICADO })
    status?: string;

    @ApiProperty({
        title: 'Visualizações',
        description: 'Contador de visualizações da página',
        type: 'integer',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, default: 0, type: 'int4' })
    views?: number;

    @ApiProperty({
        title: 'Data de Publicação',
        description: 'Data de publicação da página',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    publishedAt?: Date;

    @ApiProperty({
        title: 'Website',
        description: 'Website correspondente',
        type: () => Website,
        nullable: true,
        required: false,
    })
    @ManyToOne(() => Website)
    website?: Website;
}
