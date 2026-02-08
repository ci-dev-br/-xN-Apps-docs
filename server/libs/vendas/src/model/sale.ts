import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column, Index, OneToMany } from "typeorm";
import { SaleStatus } from "./sale-status";
import { FullAuditedEntity } from "@ci/manager";
import { schema } from "./schema";
import { SaleItem } from "./sale-item.entity";
import { SalePayment } from "./sale-payment.entity";
@Entity({ schema })
export class Sale extends FullAuditedEntity {
    @ApiProperty({ description: 'Referência ao ID do cliente no módulo de Clientes' })
    @Column({ name: 'customer_id', type: 'uuid', nullable: true })
    @Index()
    customerId: string;
    @ApiProperty({ description: 'Nome do cliente no momento da venda (Snapshot)' })
    @Column({ name: 'customer_snapshot_name', nullable: true })
    customerName: string;
    @ApiProperty({ enum: SaleStatus })
    @Column({ type: 'enum', enum: SaleStatus, default: SaleStatus.DRAFT })
    status: SaleStatus;
    @ApiProperty({ description: 'Valor total bruto dos itens' })
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    subtotal: number;
    @ApiProperty({ description: 'Valor total de descontos aplicados' })
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    discountTotal: number;
    @ApiProperty({ description: 'Valor final a ser pago' })
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    total: number;
    @ApiProperty({ description: 'Canal de venda (Ex: PDV, E-commerce, App)' })
    @Column({ name: 'sales_channel', nullable: true })
    channel: string;
    // Relacionamentos
    @ApiProperty({ type: () => [SaleItem] })
    @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
    items: SaleItem[];
    @ApiProperty({ type: () => [SalePayment] })
    @OneToMany(() => SalePayment, (payment) => payment.sale, { cascade: true })
    payments: SalePayment[];
}