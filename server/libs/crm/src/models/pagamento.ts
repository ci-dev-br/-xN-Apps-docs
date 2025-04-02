import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { schema } from "./schema";
import { ApiProperty } from "@nestjs/swagger";
import { Agendamento } from "./agendamento";
import { VendaProduto } from "./venda-produto";
import { Atendimento } from "./atendimento";
import { Cliente } from "./cliente";
import { FullAuditedEntity } from "@ci/manager";

@Entity({
    schema
})
export class Pagamento extends FullAuditedEntity {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ nullable: true })
    @Column({ nullable: true })
    agendamento_id?: number;

    @OneToOne(() => Agendamento, (agendamento) => agendamento.pagamento, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'agendamento_id' })
    agendamento?: Agendamento;

    @ApiProperty({ nullable: true })
    @Column({ nullable: true })
    venda_produto_id?: number;

    @OneToOne(() => VendaProduto, (vendaProduto) => vendaProduto.pagamento, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'venda_produto_id' })
    vendaProduto?: VendaProduto;

    @ApiProperty({ nullable: true })
    @Column({ nullable: true })
    atendimento_id?: number;

    @OneToOne(() => Atendimento, (atendimento) => atendimento.pagamento, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'atendimento_id' })
    atendimento?: Atendimento;

    @ApiProperty()
    @Column()
    cliente_id: number;

    @ManyToOne(() => Cliente, (cliente) => cliente.pagamentos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cliente_id' })
    cliente: Cliente;

    @ApiProperty({ type: 'string', format: 'date-time' })
    @Column({ type: 'datetime' })
    data_pagamento: Date;

    @ApiProperty({ type: 'number', format: 'float' })
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    valor: number;

    @ApiProperty({ enum: FormaPagamento })
    @Column({ type: 'enum', enum: FormaPagamento })
    forma_pagamento: FormaPagamento;

    @ApiProperty({ enum: StatusPagamento })
    @Column({ type: 'enum', enum: StatusPagamento, default: StatusPagamento.PENDENTE })
    status: StatusPagamento;

    @ApiProperty({ maxLength: 255, nullable: true })
    @Column({ length: 255, nullable: true })
    numero_transacao?: string;

    @CreateDateColumn()
    data_criacao: Date;

    @UpdateDateColumn()
    data_atualizacao: Date;
}