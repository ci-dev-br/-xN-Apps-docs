import { ApiProperty } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { schema } from "./schema";
import { Atendimento } from "./atendimento";
import { Cliente } from "./cliente";
import { Produto } from "./produto";
import { FullAuditedEntity } from "@ci/manager";

@Entity({ schema })
export class VendaProduto extends FullAuditedEntity {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ nullable: true })
    @Column({ nullable: true })
    atendimento_id?: number;

    @ManyToOne(() => Atendimento, (atendimento) => atendimento.vendasProdutos, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'atendimento_id' })
    atendimento?: Atendimento;

    @ApiProperty()
    @Column()
    cliente_id: number;

    @ManyToOne(() => Cliente, (cliente) => cliente.vendasProdutos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cliente_id' })
    cliente: Cliente;

    @ApiProperty()
    @Column()
    produto_id: number;

    @ManyToOne(() => Produto, (produto) => produto.vendasProdutos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'produto_id' })
    produto: Produto;

    @ApiProperty()
    @Column({ type: 'int' })
    quantidade: number;

    @ApiProperty({ type: 'number', format: 'float' })
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    preco_unitario: number;
}