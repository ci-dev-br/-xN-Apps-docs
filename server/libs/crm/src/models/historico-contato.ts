import { ApiProperty } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Cliente } from "./cliente";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";

@Entity({ schema })
export class HistoricoContato extends FullAuditedEntity {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column()
    clienteId: number;

    @ManyToOne(() => Cliente, (cliente) => cliente.historicoContatos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'clienteId' })
    cliente: Cliente;

    @ApiProperty({ type: 'string', format: 'date-time' })
    @Column({ type: 'datetime' })
    dataHora: Date;

    @ApiProperty({ enum: TipoContato })
    @Column({ type: 'enum', enum: TipoContato })
    tipoContato: TipoContato;

    @ApiProperty({ type: 'string', nullable: true })
    @Column({ type: 'text', nullable: true })
    detalhes?: string;

    @ApiProperty({ length: 255, nullable: true })
    @Column({ length: 255, nullable: true })
    responsavel?: string;
}