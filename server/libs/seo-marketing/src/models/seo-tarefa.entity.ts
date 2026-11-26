import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToOne } from "typeorm";
import { schema } from "./schema";
import { SeoDomain } from "./seo-domain.entity";
import { SeoPage } from "./seo-page.entity";

export enum SeoTarefaStatus {
    ABERTA = 'ABERTA',
    EM_ANDAMENTO = 'EM_ANDAMENTO',
    CONCLUIDA = 'CONCLUIDA',
}
/**
 * Tarefa de manutenção de SEO (backlog do time).
 * Pode ser criada manualmente ou automaticamente pela auditoria de páginas.
 */
@Entity({ schema })
export class SeoTarefa extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true }) titulo?: string;
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true, type: 'text' }) descricao?: string;
    @ApiProperty({ nullable: true, required: false, description: 'Código do problema de origem (ex.: TITLE_MISSING)' })
    @Column({ nullable: true }) codigoIssue?: string;
    @ApiProperty({ nullable: true, required: false, enum: ['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'] })
    @Column({ nullable: true, default: 'MEDIA' }) prioridade?: string;
    @ApiProperty({ nullable: true, required: false, enum: SeoTarefaStatus })
    @Column({ nullable: true, default: SeoTarefaStatus.ABERTA }) status?: SeoTarefaStatus;
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true }) responsavel?: string;
    @ApiProperty({ nullable: true, required: false, type: () => SeoDomain })
    @ManyToOne(() => SeoDomain, { nullable: true, onDelete: 'SET NULL' })
    dominio?: SeoDomain;
    @ApiProperty({ nullable: true, required: false, type: () => SeoPage })
    @ManyToOne(() => SeoPage, { nullable: true, onDelete: 'SET NULL' })
    pagina?: SeoPage;
}
