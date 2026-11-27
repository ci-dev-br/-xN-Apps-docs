import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { FullAuditedEntity } from "@ci/manager";
import { schema } from "./schema";
import { ClienteCrm } from "./cliente";
import { Oportunidade } from "./oportunidade";
import { TipoAtividadeCrm } from "./tipo-atividade-crm";
import { StatusAtividadeCrm } from "./status-atividade-crm";

@Entity({ schema })
export class AtividadeCrm extends FullAuditedEntity {
    @ApiProperty({
        title: 'Tipo',
        description: 'Categoria da atividade ou follow-up (call, meeting, email, task)',
        enum: TipoAtividadeCrm,
        default: TipoAtividadeCrm.TASK,
        required: false,
        nullable: false,
    })
    @Column({
        type: 'enum',
        enum: TipoAtividadeCrm,
        default: TipoAtividadeCrm.TASK,
    })
    tipo: TipoAtividadeCrm;

    @ApiProperty({
        title: 'Título',
        description: 'Descrição resumida da atividade ou follow-up',
        maxLength: 255,
        required: true,
        nullable: false,
    })
    @Column({ length: 255 })
    titulo: string;

    @ApiProperty({
        title: 'Cliente / Empresa',
        description: 'Nome do cliente ou empresa relacionada',
        maxLength: 255,
        required: false,
        nullable: true,
    })
    @Column({ length: 255, nullable: true })
    clienteNome?: string;

    @ApiProperty({
        title: 'ID do Cliente CRM',
        description: 'Identificador interno (UUID) do cliente CRM vinculado',
        required: false,
        nullable: true,
    })
    @Column({ type: 'uuid', nullable: true })
    clienteId?: string;

    @ManyToOne(() => ClienteCrm, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'cliente_id' })
    cliente?: ClienteCrm;

    @ApiProperty({
        title: 'ID da Oportunidade',
        description: 'Identificador interno (UUID) da oportunidade vinculada',
        required: false,
        nullable: true,
    })
    @Column({ type: 'uuid', nullable: true })
    oportunidadeId?: string;

    @ManyToOne(() => Oportunidade, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'oportunidade_id' })
    oportunidade?: Oportunidade;

    @ApiProperty({
        title: 'Data Prevista',
        description: 'Data e hora previstas para realização do follow-up',
        type: 'string',
        format: 'date-time',
        required: false,
        nullable: true,
    })
    @Column({ type: 'timestamp', nullable: true })
    dataPrevista?: Date;

    @ApiProperty({
        title: 'Prazo',
        description: 'Descrição textual ou horário previsto (ex: Hoje às 15:00)',
        maxLength: 120,
        required: false,
        nullable: true,
    })
    @Column({ length: 120, nullable: true })
    prazoTexto?: string;

    @ApiProperty({
        title: 'Status',
        description: 'Situação atual da atividade',
        enum: StatusAtividadeCrm,
        default: StatusAtividadeCrm.PENDING,
        required: false,
        nullable: false,
    })
    @Column({
        type: 'enum',
        enum: StatusAtividadeCrm,
        default: StatusAtividadeCrm.PENDING,
    })
    status: StatusAtividadeCrm;

    @ApiProperty({
        title: 'Responsável',
        description: 'Responsável pela execução da atividade',
        maxLength: 255,
        required: false,
        nullable: true,
    })
    @Column({ length: 255, nullable: true })
    responsavel?: string;

    @ApiProperty({
        title: 'Observações',
        description: 'Anotações e contexto adicional do follow-up',
        type: 'string',
        required: false,
        nullable: true,
    })
    @Column({ type: 'text', nullable: true })
    observacoes?: string;
}
