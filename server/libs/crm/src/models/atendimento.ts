import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { schema } from "./schema";
import { ApiProperty } from "@nestjs/swagger";
import { Agendamento } from "./agendamento";
import { Profissional } from "./profissional";
import { Cliente } from "./cliente";
import { Servico } from "./servico";
import { VendaProduto } from "./venda-produto";
import { Pagamento } from "./pagamento";
import { FullAuditedEntity } from "@ci/manager";

@Entity({
    schema
})
export class Atendimento extends FullAuditedEntity {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column({ nullable: true })
    agendamentoId?: number;

    @OneToOne(() => Agendamento, (agendamento) => agendamento.atendimento, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'agendamentoId' })
    agendamento?: Agendamento;

    @ApiProperty({ type: 'string', format: 'date-time' })
    @Column({ type: 'datetime' })
    dataInicio: Date;

    @ApiProperty({ type: 'string', format: 'date-time' })
    @Column({ type: 'datetime' })
    dataFim: Date;

    @ApiProperty()
    @Column()
    profissionalId: number;

    @ManyToOne(() => Profissional, (profissional) => profissional.atendimentos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'profissionalId' })
    profissional: Profissional;

    @ApiProperty()
    @Column()
    clienteId: number;

    @ManyToOne(() => Cliente, (cliente) => cliente.atendimentos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'clienteId' })
    cliente: Cliente;

    @ApiProperty()
    @Column()
    servicoId: number;

    @ManyToOne(() => Servico, (servico) => servico.atendimentos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'servicoId' })
    servico: Servico;

    @ApiProperty({ type: 'string', nullable: true })
    @Column({ type: 'text', nullable: true })
    anotacoes?: string;

    @ApiProperty({ type: 'number', nullable: true })
    @Column({ type: 'int', nullable: true })
    avaliacaoCliente?: number;

    @OneToMany(() => VendaProduto, (vendaProduto) => vendaProduto.atendimento)
    vendasProdutos: VendaProduto[];

    @OneToOne(() => Pagamento, (pagamento) => pagamento.atendimento)
    pagamento?: Pagamento;
}