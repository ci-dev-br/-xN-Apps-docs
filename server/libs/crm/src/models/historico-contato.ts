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
    cliente_id: number;

    @ManyToOne(() => Cliente, (cliente) => cliente.historicoContatos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cliente_id' })
    cliente: Cliente;

    @ApiProperty({ type: 'string', format: 'date-time' })
    @Column({ type: 'datetime' })
    data_hora: Date;

    @ApiProperty({ enum: TipoContato })
    @Column({ type: 'enum', enum: TipoContato })
    tipo_contato: TipoContato;

    @ApiProperty({ type: 'string', nullable: true })
    @Column({ type: 'text', nullable: true })
    detalhes?: string;

    @ApiProperty({ length: 255, nullable: true })
    @Column({ length: 255, nullable: true })
    responsavel?: string;
}