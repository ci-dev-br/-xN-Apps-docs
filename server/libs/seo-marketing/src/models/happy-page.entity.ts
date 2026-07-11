import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { schema } from './schema';

@Entity({ schema })
export class HappyPage {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({ unique: true })
    url: string;
    @Column()
    title: string;
    @Column({ type: 'text', nullable: true })
    snippet: string;
    @CreateDateColumn()
    catalogedAt: Date;
}