import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Unique, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { News } from './news.entity';
import { User } from '@ci/auth/models/user.entity';

export enum TipoVoto {
    UP = 'UP',
    DOWN = 'DOWN'
}

/**
 * Entidade que registra os votos (up / down) de usuários nas notícias do Noticiário Diário.
 */
@Entity()
@Unique(['news', 'user'])
export class NewsVote {
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

    @ApiProperty({ enum: TipoVoto })
    @Column({ type: 'varchar' })
    vote: TipoVoto;

    @ApiProperty()
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty()
    @UpdateDateColumn()
    updatedAt: Date;
}
