import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { News } from './news.entity';

export enum SourceStatus {
    DISCOVERED = 'DISCOVERED', // Recém encontrada pelo robô
    SANDBOX = 'SANDBOX',       // Em fase de testes
    ACTIVE = 'ACTIVE',         // Validada e pronta para uso
    SUSPENDED = 'SUSPENDED',   // Com muitos erros
}

@Entity('sources')
export class Source {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    name: string;

    @Column({ unique: true })
    searchUrlTemplate: string; // URL do feed RSS

    @Column({ nullable: true })
    domain: string; // ex: techtudo.com.br

    @Column({ type: 'varchar', default: SourceStatus.DISCOVERED })
    status: SourceStatus;

    @Column({ default: true })
    supportsSearch: boolean; // Se false, o robô vai baixar o feed todo e filtrar no código

    @Column({ default: 0 })
    consecutiveErrors: number;

    @Column({ default: 0 })
    totalRequests: number;

    @Column({ default: 0 })
    successfulRequests: number;

    @OneToMany(() => News, (news) => news.sourceInfo)
    news: News[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}