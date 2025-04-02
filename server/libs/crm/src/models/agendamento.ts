import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { schema } from "./schema";
import { ApiProperty } from "@nestjs/swagger";
import { Cliente } from "./cliente";
import { Servico } from "./servico";
import { Profissional } from "./profissional";
import { Atendimento } from "./atendimento";
import { Pagamento } from "./pagamento";
import { FullAuditedEntity } from "@ci/manager";

@Entity({
    schema
})
export class Agendamento extends FullAuditedEntity {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column()
    clienteId: number;

    @ManyToOne(() => Cliente, (cliente) => cliente.agendamentos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cliente_id' })
    cliente: Cliente;

    @ApiProperty()
    @Column()
    servico_id: number;

    @ManyToOne(() => Servico, (servico) => servico.agendamentos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'servico_id' })
    servico: Servico;

    @ApiProperty()
    @Column()
    profissional_id: number;

    @ManyToOne(() => Profissional, (profissional) => profissional.agendamentos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'profissional_id' })
    profissional: Profissional;

    @ApiProperty({ type: 'string', format: 'date-time' })
    @Column({ type: 'datetime' })
    dataHora: Date;

    @ApiProperty({ type: 'string', format: 'time' })
    @Column({ type: 'time' })
    duracao: string;

    @ApiProperty({ enum: AgendamentoStatus })
    @Column({ type: 'enum', enum: AgendamentoStatus, default: AgendamentoStatus.AGENDADO })
    status: AgendamentoStatus;

    @ApiProperty({ type: 'number', format: 'float' })
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    valor: number;

    @ApiProperty({ type: 'string', nullable: true })
    @Column({ type: 'text', nullable: true })
    observacoes?: string;

    @OneToOne(() => Atendimento, (atendimento) => atendimento.agendamento)
    atendimento?: Atendimento;

    @OneToOne(() => Pagamento, (pagamento) => pagamento.agendamento)
    pagamento?: Pagamento;
}