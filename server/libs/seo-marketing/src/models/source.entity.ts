import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { News } from './news.entity';
import { schema } from './schema';
export enum SourceStatus {
    DISCOVERED = 'DISCOVERED', // Recém encontrada pelo robô
    SANDBOX = 'SANDBOX',       // Em fase de testes
    ACTIVE = 'ACTIVE',         // Validada e pronta para uso
    SUSPENDED = 'SUSPENDED',   // Com muitos erros
}
@Entity({ schema })
export class Source {
    @ApiProperty({ required: false, nullable: true })
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @ApiProperty({ required: false, nullable: true })
    @Column({ nullable: true })
    name?: string;
    @ApiProperty({ required: false, nullable: true, description: 'URL do feed RSS' })
    @Column({ unique: true })
    searchUrlTemplate?: string; // URL do feed RSS
    @ApiProperty({ required: false, nullable: true, description: 'Domínio da fonte (ex: techtudo.com.br)' })
    @Column({ nullable: true })
    domain?: string; // ex: techtudo.com.br
    @ApiProperty({
        enum: SourceStatus,
        required: false,
        nullable: true,
        default: SourceStatus.ACTIVE,
    })
    @Index({})
    @Column({ type: 'varchar', default: SourceStatus.ACTIVE })
    status?: SourceStatus;
    @ApiProperty({
        required: false,
        default: true,
        description: 'Se false, o robô vai baixar o feed todo e filtrar no código',
    })
    @Column({ default: true })
    supportsSearch: boolean; // Se false, o robô vai baixar o feed todo e filtrar no código
    @ApiProperty({ required: false, nullable: true, default: 0 })
    @Column({ default: 0 })
    consecutiveErrors?: number;
    @ApiProperty({ required: false, default: 0 })
    @Column({ default: 0 })
    totalRequests: number;
    @ApiProperty({ required: false, nullable: true, default: 0 })
    @Column({ default: 0 })
    successfulRequests?: number;
    @OneToMany(() => News, (news) => news.sourceInfo)
    news?: News[];
    @ApiProperty({ required: false, nullable: true })
    @CreateDateColumn()
    createdAt?: Date;
    @ApiProperty({ required: false, nullable: true })
    @UpdateDateColumn()
    updatedAt?: Date;
}