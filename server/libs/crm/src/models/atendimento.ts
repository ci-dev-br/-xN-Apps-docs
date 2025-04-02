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
    agendamento_id?: number;

    @OneToOne(() => Agendamento, (agendamento) => agendamento.atendimento, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'agendamento_id' })
    agendamento?: Agendamento;

    @ApiProperty({ type: 'string', format: 'date-time' })
    @Column({ type: 'datetime' })
    data_inicio: Date;

    @ApiProperty({ type: 'string', format: 'date-time' })
    @Column({ type: 'datetime' })
    data_fim: Date;

    @ApiProperty()
    @Column()
    profissional_id: number;

    @ManyToOne(() => Profissional, (profissional) => profissional.atendimentos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'profissional_id' })
    profissional: Profissional;

    @ApiProperty()
    @Column()
    cliente_id: number;

    @ManyToOne(() => Cliente, (cliente) => cliente.atendimentos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cliente_id' })
    cliente: Cliente;

    @ApiProperty()
    @Column()
    servico_id: number;

    @ManyToOne(() => Servico, (servico) => servico.atendimentos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'servico_id' })
    servico: Servico;

    @ApiProperty({ type: 'string', nullable: true })
    @Column({ type: 'text', nullable: true })
    anotacoes?: string;

    @ApiProperty({ type: 'number', nullable: true })
    @Column({ type: 'int', nullable: true })
    avaliacao_cliente?: number;

    @OneToMany(() => VendaProduto, (vendaProduto) => vendaProduto.atendimento)
    vendasProdutos: VendaProduto[];

    @OneToOne(() => Pagamento, (pagamento) => pagamento.atendimento)
    pagamento?: Pagamento;
}