import { Column, Entity, Index, OneToMany } from "typeorm";
import { schema } from "../norms";
import { FullAuditedEntity } from "@ci/manager/dao/entities";
import { ApiProperty } from "@nestjs/swagger";
import { TransacaoCarteira } from "./transacao-carteira.entity";

/**
 * Entidade de Carteira do Usuário
 * Responsável pela custódia de saldo, depósitos identificados e pagamento de faturas.
 */
@Entity({ schema })
export class Carteira extends FullAuditedEntity {
    @ApiProperty({ title: 'ID do Usuário', description: 'Usuário proprietário da carteira' })
    @Column({ nullable: true })
    @Index()
    userId?: string;

    @ApiProperty({ title: 'Número da Carteira', description: 'Código único para depósitos identificados' })
    @Column({ nullable: true, unique: true })
    @Index()
    numeroCarteira?: string;

    @ApiProperty({ title: 'Saldo', description: 'Saldo disponível na carteira' })
    @Column({ type: 'numeric', precision: 14, scale: 2, default: 0.00 })
    saldo: number;

    @ApiProperty({ title: 'Moeda', description: 'Moeda da carteira (ex: BRL, USD)' })
    @Column({ default: 'BRL', length: 5 })
    moeda: string;

    @ApiProperty({ title: 'Status', description: 'Status operacional da carteira' })
    @Column({ default: 'ATIVA' })
    status: 'ATIVA' | 'BLOQUEADA' | 'SUSPENSA';

    @ApiProperty({ title: 'Limite Operacional Diário', required: false })
    @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
    limiteDiario?: number;

    @ApiProperty({ title: 'Transações da Carteira', isArray: true, type: () => TransacaoCarteira, required: false })
    @OneToMany(() => TransacaoCarteira, (transacao) => transacao.carteira)
    transacoes?: TransacaoCarteira[];
}
