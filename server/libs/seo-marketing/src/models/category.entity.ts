import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { News } from './news.entity';
import { schema } from './schema';
import { CategoryEvent } from './category-event.entity';

@Entity({ schema })
export class Category {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @ApiProperty({ example: 'Inteligência Artificial' })
    @Column({ unique: true })
    name?: string;

    @ApiProperty({ example: true, description: 'Se o assunto está em alta no momento' })
    @Column({ default: true })
    isTrending?: boolean;

    @OneToMany(() => News, (news) => news.category)
    news?: News[];

    @CreateDateColumn()
    createdAt?: Date;
    @ApiProperty({ example: 50000, description: 'Volume aproximado de buscas que tornou o assunto tendência' })
    @Column({ type: 'int', default: 0 })
    trendVolume: number;
    // NOVO: Relacionamento com o histórico de eventos
    @OneToMany(() => CategoryEvent, (event) => event.category)
    events: CategoryEvent[];
}