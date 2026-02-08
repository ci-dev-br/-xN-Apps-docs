import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { schema } from './schema';
import { FullAuditedEntity } from '@ci/manager';
import { Sale } from './sale';
@Entity({ schema })
export class SaleItem extends FullAuditedEntity {
    @ApiProperty({ type: () => Sale })
    @ManyToOne(() => Sale, (sale) => sale.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sale_id' })
    sale: Sale;
    @ApiProperty({ description: 'ID do produto no módulo de Catálogo' })
    @Column({ name: 'product_id', type: 'uuid' })
    productId: string;
    @ApiProperty({ description: 'Nome do produto no momento da venda (Snapshot)' })
    @Column({ name: 'product_snapshot_name' })
    productName: string;
    @ApiProperty({ description: 'SKU do produto no momento da venda (Snapshot)' })
    @Column({ name: 'product_snapshot_sku', nullable: true })
    sku: string;
    @ApiProperty({ description: 'Quantidade vendida' })
    @Column({ type: 'decimal', precision: 10, scale: 3 })
    quantity: number;
    @ApiProperty({ description: 'Preço unitário no momento da venda' })
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    unitPrice: number;
    @ApiProperty({ description: 'Desconto aplicado especificamente neste item' })
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    discount: number;
    @ApiProperty({ description: 'Subtotal (qtde * preço - desconto)' })
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total: number;
}