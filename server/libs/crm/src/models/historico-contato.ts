import { ApiProperty } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { ClienteCrm } from "./cliente";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
import { TipoContato } from "./tipo-contato";

@Entity({ schema })
export class HistoricoContato extends FullAuditedEntity {

    @ApiProperty()
    @Column()
    clienteId: number;

    @ManyToOne(() => ClienteCrm, (cliente) => cliente.historicoContatos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'clienteId' })
    cliente: ClienteCrm;

    @ApiProperty({ type: 'string', format: 'date-time' })
    @Column({  })
    dataHora: Date;

    @ApiProperty({ enum: TipoContato })
    @Column({ type: 'enum', enum: TipoContato })
    tipoContato: TipoContato;

    @ApiProperty({ type: 'string', nullable: true })
    @Column({ type: 'text', nullable: true })
    detalhes?: string;

    @ApiProperty({ maxLength: 255, nullable: true })
    @Column({ length: 255, nullable: true })
    responsavel?: string;
}