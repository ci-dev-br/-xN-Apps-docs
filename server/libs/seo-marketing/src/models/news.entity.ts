import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from './category.entity';
import { schema } from './schema';
import { Source } from './source.entity';

@Entity({ schema })
export class News {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column({ unique: true })
    title: string;

    @ApiProperty()
    @Column({ unique: true })
    url: string;

    @ApiProperty()
    @Column({ nullable: true })
    source: string;

    // NOVO CAMPO: Armazena o texto extraído da página
    @ApiProperty({ description: 'Conteúdo em texto extraído da página web' })
    @Column({ type: 'text', nullable: true })
    content: string;

    @CreateDateColumn()
    scrapedAt: Date;

    @ApiProperty()
    @Column({ nullable: true })
    sourceName: string; // Renomeado de source para sourceName (texto original vindo do RSS)
    // Se a fonte for deletada, apenas seta como NULL na notícia, sem apagar a notícia
    @ManyToOne(() => Source, (source) => source.news, {
        nullable: true,
        onDelete: 'SET NULL'
    })
    sourceInfo: Source;

    // Se a categoria for apagada do banco, todas as notícias atreladas a ela são apagadas junto (Cascade)
    @ManyToOne(() => Category, (category) => category.news, {
        onDelete: 'CASCADE'
    })
    category: Category;

    @ApiProperty({ nullable: true, required: false })
    @UpdateDateColumn({ nullable: true, default: null })
    modifiedAt?: Date;
}