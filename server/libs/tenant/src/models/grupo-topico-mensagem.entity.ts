import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * Mensagem ou resposta em um tópico de discussão de grupo.
 */
@Entity()
export class GrupoTopicoMensagem {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @ApiProperty({ description: 'ID do tópico de discussão' })
    @Column()
    topicoId: string;

    @ApiProperty({ description: 'ID do autor da resposta' })
    @Column()
    authorId: string;

    @ApiProperty({ nullable: true })
    @Column({ nullable: true })
    authorName?: string;

    @ApiProperty({ nullable: true })
    @Column({ nullable: true, type: 'text' })
    authorPhoto?: string;

    @ApiProperty({ description: 'Texto da resposta' })
    @Column({ type: 'text' })
    content: string;

    @ApiProperty({ nullable: true })
    @CreateDateColumn()
    createdAt?: Date;
}
