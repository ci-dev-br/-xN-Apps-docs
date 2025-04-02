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
    atendimentoId?: number;

    @ManyToOne(() => Atendimento, (atendimento) => atendimento.vendasProdutos, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'atendimentoId' })
    atendimento?: Atendimento;

    @ApiProperty()
    @Column()
    clienteId: number;

    @ManyToOne(() => Cliente, (cliente) => cliente.vendasProdutos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'clienteId' })
    cliente: Cliente;

    @ApiProperty()
    @Column()
    produtoId: number;

    @ManyToOne(() => Produto, (produto) => produto.vendasProdutos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'produtoId' })
    produto: Produto;

    @ApiProperty()
    @Column({ type: 'int' })
    quantidade: number;

    @ApiProperty({ type: 'number', format: 'float' })
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precoUnitario: number;
}