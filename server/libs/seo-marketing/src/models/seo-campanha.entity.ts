import { FullAuditedEntity } from "@ci/manager";
import { Column, Entity, ManyToOne } from "typeorm";
import { schema } from "./schema";
import { ApiProperty } from "@nestjs/swagger";
import { SeoDomain } from "./seo-domain.entity";

/**
 * Campanha de SEO e aquisição orgânica
 */
@Entity({ schema })
export class SeoCampanha extends FullAuditedEntity {
    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Nome da Campanha',
        description: 'Título identificador da campanha de SEO',
    })
    @Column({ nullable: true })
    nome: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Objetivo',
        description: 'Meta principal da campanha orgânica',
    })
    @Column({ nullable: true })
    objetivo?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Status',
        description: 'Situação atual da campanha',
        enum: ['PLANEJADA', 'ATIVA', 'PAUSADA', 'CONCLUIDA'],
        default: 'PLANEJADA',
    })
    @Column({ nullable: true, default: 'PLANEJADA' })
    status?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Data de Início',
        type: 'string',
        format: 'date-time',
    })
    @Column({ nullable: true, type: 'timestamp' })
    inicio?: Date;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Data de Término',
        type: 'string',
        format: 'date-time',
    })
    @Column({ nullable: true, type: 'timestamp' })
    fim?: Date;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Domínio',
        description: 'Domínio principal da campanha',
        type: () => SeoDomain,
    })
    @ManyToOne(() => SeoDomain, { nullable: true, onDelete: 'SET NULL' })
    dominio?: SeoDomain;
}
