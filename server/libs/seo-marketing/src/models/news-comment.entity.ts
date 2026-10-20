import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { News } from './news.entity';
import { User } from '@ci/auth/models/user.entity';

/**
 * Entidade que registra comentários de usuários nas notícias do Noticiário Diário.
 */
@Entity()
export class NewsComment {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ type: () => News })
    @ManyToOne(() => News, { onDelete: 'CASCADE' })
    @JoinColumn()
    news: News;

    @ApiProperty({ type: () => User })
    @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
    @JoinColumn()
    user: User;

    @ApiProperty({ description: 'Conteúdo textual do comentário' })
    @Column({ type: 'text' })
    content: string;

    @ApiProperty()
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty()
    @UpdateDateColumn()
    updatedAt: Date;
}
