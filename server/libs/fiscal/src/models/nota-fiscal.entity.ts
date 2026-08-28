import { FullAuditedEntity } from '@ci/manager';
import { Entity, Column, CreateDateColumn } from 'typeorm';
import { schema } from './schema';

@Entity({ schema })
export class NotaFiscal extends FullAuditedEntity {

    @Column({ type: 'varchar', length: 14 })
    cnpjPrestador?: string;

    @Column({ type: 'varchar', length: 14 })
    cnpjTomador?: string;

    @Column('decimal', { precision: 10, scale: 2 })
    valorTotal?: number;

    @Column({ type: 'text' })
    descricaoServico?: string;

    @Column({ default: 'PENDENTE' })
    status?: 'PENDENTE' | 'PROCESSANDO' | 'AUTORIZADA' | 'REJEITADA';

    @Column({ nullable: true })
    numeroNota?: string;

    @Column({ nullable: true })
    codigoVerificacao?: string;

    @CreateDateColumn()
    dataCriacao?: Date;
}