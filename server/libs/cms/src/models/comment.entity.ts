import { Column, Entity, ManyToOne } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
import { SitePost } from "./site-post.entity";
import { Website } from "./website.entity";
import { ApiProperty } from "@nestjs/swagger";
import { CommentStatus } from "./cms-enums";

/**
 * Comentários publicados em conteúdos do CMS
 */
@Entity({ schema })
export class Comment extends FullAuditedEntity {
    @ApiProperty({
        title: 'Autor',
        description: 'Nome do autor do comentário',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    author?: string;

    @ApiProperty({
        title: 'E-mail do Autor',
        description: 'Endereço de e-mail do autor',
        format: 'email',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    authorEmail?: string;

    @ApiProperty({
        title: 'URL do Autor',
        description: 'Site ou perfil público do autor',
        format: 'url',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    authorUrl?: string;

    @ApiProperty({
        title: 'IP do Autor',
        description: 'Endereço IP de origem do comentário',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    authorIp?: string;

    @ApiProperty({
        title: 'Conteúdo',
        description: 'Texto do comentário enviado pelo leitor',
        format: 'textarea',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, type: 'text' })
    content?: string;

    @ApiProperty({
        title: 'Status',
        description: 'Estado de moderação do comentário',
        enum: CommentStatus,
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, default: CommentStatus.PENDENTE })
    status?: string;

    @ApiProperty({
        title: 'Publicação',
        description: 'Post ao qual o comentário pertence',
        type: () => SitePost,
        nullable: true,
        required: false,
    })
    @ManyToOne(() => SitePost)
    post?: SitePost;

    @ApiProperty({
        title: 'Website',
        description: 'Website associado ao comentário',
        type: () => Website,
        nullable: true,
        required: false,
    })
    @ManyToOne(() => Website)
    website?: Website;

    @ApiProperty({
        title: 'Comentário Pai',
        description: 'Comentário original quando for uma resposta',
        type: () => Comment,
        nullable: true,
        required: false,
    })
    @ManyToOne(() => Comment)
    parent?: Comment;

    @ApiProperty({
        title: 'Data de Publicação',
        description: 'Data e hora de publicação do comentário',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    publishingAt?: Date;
}
