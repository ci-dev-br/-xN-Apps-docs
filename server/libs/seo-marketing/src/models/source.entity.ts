import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { News } from './news.entity';
import { schema } from './schema';

@Entity({ schema })
export class Source {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ example: 'Google News' })
    @Column({ unique: true })
    name: string;

    @ApiProperty({ description: 'URL base com a tag {{query}} para substituição' })
    @Column()
    searchUrlTemplate: string;

    @ApiProperty({ description: 'Define se a fonte está ativa para buscas' })
    @Column({ default: true })
    isActive: boolean;

    // ==========================================
    // CARACTERÍSTICAS / FEEDBACK DINÂMICO
    // ==========================================
    @Column({ default: 0 })
    consecutiveErrors: number;

    @Column({ default: 0 })
    totalRequests: number;

    @Column({ default: 0 })
    successfulRequests: number;

    @ApiProperty({ description: 'Características flexíveis (ex: precisa de proxy, limite de rate, etc)' })
    @Column({ type: 'jsonb', nullable: true })
    characteristics: Record<string, any>;

    @OneToMany(() => News, (news) => news.sourceInfo)
    news: News[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}