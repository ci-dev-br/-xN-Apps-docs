import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { schema } from "./schema";
import { Atendimento } from "./atendimento";
import { ClienteCrm } from "./cliente";
import { Produto } from "./produto";
import { FullAuditedEntity } from "@ci/manager";
import { Pagamento } from "./pagamento";

@Entity({ schema })
export class VendaProduto extends FullAuditedEntity {

    @ApiProperty({ nullable: true })
    @Column({ nullable: true })
    atendimentoId?: number;

    @ApiProperty({ type: Atendimento })
    @ManyToOne(() => Atendimento, (atendimento) => atendimento.vendasProdutos, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'atendimentoId' })
    atendimento?: Atendimento;

    @ApiProperty()
    @Column()
    clienteId: number;

    @ApiProperty({ type: ClienteCrm })
    @ManyToOne(() => ClienteCrm, (cliente) => cliente.vendasProdutos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'clienteId' })
    cliente: ClienteCrm;

    @ApiProperty()
    @Column()
    produtoId: number;

    @ApiProperty({ type: Produto })
    @ManyToOne(() => Produto, (produto) => produto.vendasProdutos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'produtoId' })
    produto: Produto;

    @ApiProperty()
    @Column({ type: 'int' })
    quantidade: number;

    @ApiProperty({ type: 'number', format: 'float' })
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precoUnitario: number;

    @ApiProperty({ type: Pagamento })
    @ApiProperty({ type: Pagamento })
    @OneToOne(() => Pagamento, (pagamento) => pagamento.vendaProduto)
    pagamento?: Pagamento;
}