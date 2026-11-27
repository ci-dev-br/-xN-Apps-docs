import { Column, Entity, ManyToOne } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Comment } from "./comment.entity";

/**
 * Metadados adicionais vinculados a um Comentário CMS
 */
@Entity({ schema })
export class CommentMeta extends FullAuditedEntity {
    @ApiProperty({
        title: 'Comentário',
        description: 'Comentário associado ao metadado',
        type: () => Comment,
        nullable: true,
        required: false,
    })
    @ManyToOne(() => Comment)
    comment?: Comment;

    @ApiProperty({
        title: 'Chave',
        description: 'Chave identificadora do metadado',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    metaKey?: string;

    @ApiProperty({
        title: 'Valor',
        description: 'Valor do metadado do comentário',
        format: 'textarea',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, type: 'text' })
    metaValue?: string;
}
