import { Column, Entity, Index, ManyToOne } from "typeorm";
import { schema } from "../norms";
import { FullAuditedEntity } from "@ci/manager/dao/entities";
import { ApiProperty } from "@nestjs/swagger";
import { Carteira } from "./carteira.entity";

/**
 * Entidade de Transação da Carteira
 * Registra entradas (depósitos identificados, estornos) e saídas (pagamentos de faturas, transferências).
 */
@Entity({ schema })
export class TransacaoCarteira extends FullAuditedEntity {
    @ApiProperty({ title: 'ID da Carteira' })
    @Column({ nullable: true })
    @Index()
    carteiraId?: string;

    @ManyToOne(() => Carteira, (carteira) => carteira.transacoes, { onDelete: 'CASCADE' })
    carteira?: Carteira;

    @ApiProperty({ title: 'Tipo', enum: ['ENTRADA', 'SAIDA'], description: 'Natureza da movimentação financeira' })
    @Column()
    tipo: 'ENTRADA' | 'SAIDA';

    @ApiProperty({
        title: 'Categoria',
        enum: ['DEPOSITO', 'PAGAMENTO_FATURA', 'TRANSFERENCIA', 'ESTORNO', 'OUTROS'],
        description: 'Categoria da operação financeira'
    })
    @Column({ default: 'OUTROS' })
    categoria: 'DEPOSITO' | 'PAGAMENTO_FATURA' | 'TRANSFERENCIA' | 'ESTORNO' | 'OUTROS';

    @ApiProperty({ title: 'Valor', description: 'Valor da operação em moeda' })
    @Column({ type: 'numeric', precision: 14, scale: 2 })
    valor: number;

    @ApiProperty({ title: 'Saldo Anterior', required: false })
    @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
    saldoAnterior?: number;

    @ApiProperty({ title: 'Saldo Posterior', required: false })
    @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
    saldoPosterior?: number;

    @ApiProperty({ title: 'Descrição', description: 'Histórico da transação' })
    @Column({ nullable: true })
    descricao?: string;

    @ApiProperty({ title: 'Identificador do Depósito / Documento', required: false })
    @Column({ nullable: true })
    @Index()
    identificador?: string;

    @ApiProperty({ title: 'Referência de Fatura', description: 'ID da fatura paga, caso aplicável', required: false })
    @Column({ nullable: true })
    @Index()
    referenciaFaturaId?: string;

    @ApiProperty({ title: 'Status', enum: ['CONCLUIDA', 'PENDENTE', 'CANCELADA'], default: 'CONCLUIDA' })
    @Column({ default: 'CONCLUIDA' })
    status: 'CONCLUIDA' | 'PENDENTE' | 'CANCELADA';

    @ApiProperty({ title: 'Metadados Adicionais', required: false })
    @Column({ type: 'jsonb', nullable: true })
    metadados?: any;
}
