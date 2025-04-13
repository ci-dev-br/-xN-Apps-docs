import { ApiProperty } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { schema } from "./schema";
import { Agendamento } from "./agendamento";
import { Atendimento } from "./atendimento";
import { FullAuditedEntity } from "@ci/manager";
@Entity({
    schema
})
export class Profissional extends FullAuditedEntity {
    @ApiProperty({ maxLength: 255 })
    @Column({ length: 255 })
    nome: string;
    @ApiProperty({ maxLength: 255, nullable: true })
    @Column({ length: 255, nullable: true })
    especialidade?: string;
    @ApiProperty({ type: 'string', format: 'date', nullable: true })
    @Column({ type: 'date', nullable: true })
    dataContratacao?: Date;
    @ApiProperty({ maxLength: 255, nullable: true })
    @Column({ length: 255, nullable: true })
    email?: string;
    @ApiProperty({ maxLength: 20, nullable: true })
    @Column({ length: 20, nullable: true })
    telefone?: string;
    @OneToMany(() => Agendamento, (agendamento) => agendamento.profissional)
    agendamentos: Agendamento[];
    @OneToMany(() => Atendimento, (atendimento) => atendimento.profissional)
    atendimentos: Atendimento[];
}