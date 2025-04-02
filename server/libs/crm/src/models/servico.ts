import { ApiProperty } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from "typeorm";
import { schema } from "./schema";
import { Agendamento } from "./agendamento";
import { Atendimento } from "./atendimento";
import { Promocao } from "./promocao";
import { FullAuditedEntity } from "@ci/manager";

@Entity({
    schema
})
export class Servico extends FullAuditedEntity {

    @ApiProperty({ maxLength: 255 })
    @Column({ length: 255 })
    nome: string;

    @ApiProperty({ type: 'string', nullable: true })
    @Column({ type: 'text', nullable: true })
    descricao?: string;

    @ApiProperty({ type: 'number', format: 'float' })
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    preco: number;

    @ApiProperty({ type: 'string', format: 'time', nullable: true })
    @Column({ type: 'time', nullable: true })
    duracaoEstimada?: string;

    @ApiProperty({ maxLength: 100, nullable: true })
    @Column({ length: 100, nullable: true })
    categoria?: string;

    @OneToMany(() => Agendamento, (agendamento) => agendamento.servico)
    agendamentos: Agendamento[];

    @OneToMany(() => Atendimento, (atendimento) => atendimento.servico)
    atendimentos: Atendimento[];

    @ManyToMany(() => Promocao, (promocao) => promocao.servicos)
    promocoes: Promocao[];
}