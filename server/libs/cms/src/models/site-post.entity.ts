import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
import { Website } from "./website.entity";
import { Term } from "./term.entity";
import { ApiProperty } from "@nestjs/swagger";
import { SiteContentStatus, SiteContentType } from "./cms-enums";

/**
 * Gestão de Posts, Artigos e Comunicados do CMS
 */
@Entity({ schema })
export class SitePost extends FullAuditedEntity {
    @ApiProperty({
        title: 'Website',
        description: 'Website onde a publicação será exibida',
        type: () => Website,
        nullable: true,
        required: false,
    })
    @ManyToOne(() => Website)
    website?: Website;

    @ApiProperty({
        title: 'Título',
        description: 'Título principal da publicação',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    title?: string;

    @ApiProperty({
        title: 'Slug',
        description: 'Identificador amigável de URL',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    slug?: string;

    @ApiProperty({
        title: 'Tipo',
        description: 'Classificação da publicação (post, page, notice)',
        enum: SiteContentType,
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, default: SiteContentType.POST })
    type?: string;

    @ApiProperty({
        title: 'Categoria',
        description: 'Categoria editorial principal',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    category?: string;

    @ApiProperty({
        title: 'Autor',
        description: 'Autor ou equipe editorial responsável',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    author?: string;

    @ApiProperty({
        title: 'Conteúdo',
        description: 'Blocos de conteúdo HTML ou Markdown da publicação',
        type: String,
        isArray: true,
        format: 'html',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, array: true, type: 'varchar' })
    content?: string[];

    @ApiProperty({
        title: 'Resumo',
        description: 'Breve introdução exibida nas listagens e cards',
        format: 'textarea',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, type: 'text' })
    excerpt?: string;

    @ApiProperty({
        title: 'Status',
        description: 'Estado editorial da publicação',
        enum: SiteContentStatus,
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, default: SiteContentStatus.RASCUNHO })
    status?: string;

    @ApiProperty({
        title: 'Visualizações',
        description: 'Contador de visualizações da publicação',
        type: 'integer',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, default: 0, type: 'int4' })
    views?: number;

    @ApiProperty({
        title: 'Data de Publicação',
        description: 'Data e hora de publicação ou agendamento',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    publishedAt?: Date;

    @ApiProperty({
        title: 'Imagem de Capa',
        description: 'URL da imagem destacada da publicação',
        format: 'url',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    featuredImage?: string;

    @ApiProperty({
        title: 'GUID',
        description: 'Identificador global único da publicação',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    guid?: string;

    @ApiProperty({
        title: 'Ordem no Menu',
        description: 'Posição de ordenação editorial',
        type: 'integer',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, default: 0, type: 'int4' })
    menuOrder?: number;

    @ApiProperty({
        title: 'Termos e Tags',
        description: 'Categorias e tags associadas à publicação',
        type: () => Term,
        isArray: true,
        nullable: true,
        required: false,
    })
    @ManyToMany(() => Term)
    @JoinTable()
    terms?: Term[];
}
