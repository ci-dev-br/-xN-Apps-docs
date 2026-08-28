import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
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
    @Column()
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

    @ManyToOne(() => Category, (category) => category.news)
    category: Category;

    @CreateDateColumn()
    scrapedAt: Date;

    @ApiProperty()
    @Column({ nullable: true })
    sourceName: string; // Renomeado de source para sourceName (texto original vindo do RSS)

    @ManyToOne(() => Source, (source) => source.news, { nullable: true })
    sourceInfo: Source; // Relacionamento com a nova tabela

}