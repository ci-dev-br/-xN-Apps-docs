import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { FullAuditedEntity } from "@ci/manager";
import { schema } from "./schema";
import { ClienteCrm } from "./cliente";
import { Profissional } from "./profissional";
import { EstagioOportunidade } from "./estagio-oportunidade";
import { PrioridadeOportunidade } from "./prioridade-oportunidade";

@Entity({ schema })
export class Oportunidade extends FullAuditedEntity {
    @ApiProperty({
        title: 'Título do Negócio',
        description: 'Título da oportunidade comercial no funil de vendas',
        maxLength: 255,
        required: true,
        nullable: false,
    })
    @Column({ length: 255 })
    titulo: string;

    @ApiProperty({
        title: 'Cliente / Empresa',
        description: 'Nome do cliente ou empresa prospectada',
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
        title: 'Valor Estimado (R$)',
        description: 'Valor monetário estimado da oportunidade',
        type: 'number',
        format: 'float',
        required: false,
        nullable: true,
        default: 0,
    })
    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    valor: number;

    @ApiProperty({
        title: 'Etapa do Funil',
        description: 'Estágio atual da oportunidade no pipeline comercial',
        enum: EstagioOportunidade,
        default: EstagioOportunidade.LEAD,
        required: false,
        nullable: false,
    })
    @Column({
        type: 'enum',
        enum: EstagioOportunidade,
        default: EstagioOportunidade.LEAD,
    })
    estagio: EstagioOportunidade;

    @ApiProperty({
        title: 'Probabilidade (%)',
        description: 'Probabilidade estimada de fechamento (0 a 100)',
        type: 'number',
        required: false,
        nullable: true,
        default: 20,
    })
    @Column({ type: 'int', default: 20 })
    probabilidade: number;

    @ApiProperty({
        title: 'Responsável',
        description: 'Nome do corretor, vendedor ou responsável pela oportunidade',
        maxLength: 255,
        required: false,
        nullable: true,
    })
    @Column({ length: 255, nullable: true })
    responsavel?: string;

    @ApiProperty({
        title: 'ID do Profissional',
        description: 'Identificador interno (UUID) do profissional responsável',
        required: false,
        nullable: true,
    })
    @Column({ type: 'uuid', nullable: true })
    profissionalId?: string;

    @ManyToOne(() => Profissional, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'profissional_id' })
    profissional?: Profissional;

    @ApiProperty({
        title: 'Prioridade',
        description: 'Prioridade comercial da oportunidade',
        enum: PrioridadeOportunidade,
        default: PrioridadeOportunidade.MEDIA,
        required: false,
        nullable: false,
    })
    @Column({
        type: 'enum',
        enum: PrioridadeOportunidade,
        default: PrioridadeOportunidade.MEDIA,
    })
    prioridade: PrioridadeOportunidade;

    @ApiProperty({
        title: 'Previsão de Fechamento',
        description: 'Data prevista para conclusão do negócio',
        type: 'string',
        format: 'date',
        required: false,
        nullable: true,
    })
    @Column({ type: 'date', nullable: true })
    previsaoFechamento?: Date;

    @ApiProperty({
        title: 'Data na Etapa Atual',
        description: 'Data e hora em que a oportunidade entrou na etapa atual',
        type: 'string',
        format: 'date-time',
        required: false,
        nullable: true,
    })
    @Column({ type: 'timestamp', nullable: true })
    dataMudancaEtapa?: Date;

    @ApiProperty({
        title: 'Data de Fechamento',
        description: 'Data e hora de fechamento quando marcada como ganha ou perdida',
        type: 'string',
        format: 'date-time',
        required: false,
        nullable: true,
    })
    @Column({ type: 'timestamp', nullable: true })
    dataFechamento?: Date;

    @ApiProperty({
        title: 'Observações',
        description: 'Notas e detalhes adicionais da negociação',
        type: 'string',
        required: false,
        nullable: true,
    })
    @Column({ type: 'text', nullable: true })
    observacoes?: string;
}
