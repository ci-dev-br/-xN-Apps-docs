import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { schema } from "./schema";
import { ApiProperty } from "@nestjs/swagger";
import { ClienteCrm } from "./cliente";
import { Servico } from "./servico";
import { Profissional } from "./profissional";
import { Atendimento } from "./atendimento";
import { Pagamento } from "./pagamento";
import { FullAuditedEntity } from "@ci/manager";
import { AgendamentoStatus } from "./agendamento-status";
@Entity({
    schema
})
export class Agendamento extends FullAuditedEntity {
    @ApiProperty()
    @Column()
    clienteId: number;
    @ManyToOne(() => ClienteCrm, (cliente) => cliente.agendamentos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'clienteId' })
    cliente: ClienteCrm;
    @ApiProperty()
    @Column()
    servicoId: number;
    @ManyToOne(() => Servico, (servico) => servico.agendamentos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'servicoId' })
    servico: Servico;
    @ApiProperty()
    @Column()
    profissionalId: number;
    @ManyToOne(() => Profissional, (profissional) => profissional.agendamentos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'profissionalId' })
    profissional: Profissional;
    @ApiProperty({ type: 'string', format: 'date-time' })
    @Column({})
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