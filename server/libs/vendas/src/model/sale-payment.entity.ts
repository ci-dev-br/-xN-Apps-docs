import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { FullAuditedEntity } from '@ci/manager';
import { Sale } from './sale';
import { PaymentMethod } from './payment-method';
import { PaymentStatus } from './payment-status';
import { schema } from './schema';
@Entity({schema})
export class SalePayment extends FullAuditedEntity {
    @ApiProperty({ type: () => Sale })
    @ManyToOne(() => Sale, (sale) => sale.payments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sale_id' })
    sale: Sale;
    @ApiProperty({ enum: PaymentMethod })
    @Column({ type: 'enum', enum: PaymentMethod })
    method: PaymentMethod;
    @ApiProperty({ description: 'Valor pago nesta transação específica' })
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;
    @ApiProperty({ enum: PaymentStatus })
    @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
    status: PaymentStatus;
    @ApiProperty({ description: 'ID da transação no gateway de pagamento (se houver)' })
    @Column({ name: 'gateway_transaction_id', nullable: true })
    gatewayTransactionId: string;
    @ApiProperty({ description: 'Metadados do pagamento (JSON bruto do gateway)' })
    @Column({ type: 'jsonb', nullable: true })
    metadata: any;
}