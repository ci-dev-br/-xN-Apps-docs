import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

/**
 * Tópico de discussão dentro de um Grupo.
 * Vinculado ao grupo e ao tenant do grupo.
 */
@Entity()
export class GrupoTopico {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @ApiProperty({ description: 'ID do grupo' })
    @Column()
    grupoId: string;

    @ApiProperty({ description: 'ID do tenant do grupo para isolamento de dados' })
    @Column()
    tenantId: string;

    @ApiProperty({ description: 'Título do tópico' })
    @Column()
    title: string;

    @ApiProperty({ description: 'Conteúdo da mensagem inicial' })
    @Column({ type: 'text' })
    content: string;

    @ApiProperty({ description: 'ID do autor' })
    @Column()
    authorId: string;

    @ApiProperty({ nullable: true })
    @Column({ nullable: true })
    authorName?: string;

    @ApiProperty({ nullable: true })
    @Column({ nullable: true, type: 'text' })
    authorPhoto?: string;

    @ApiProperty({ default: 0 })
    @Column({ default: 0 })
    repliesCount: number;

    @ApiProperty({ nullable: true })
    @CreateDateColumn()
    createdAt?: Date;

    @ApiProperty({ nullable: true })
    @UpdateDateColumn()
    updatedAt?: Date;
}
