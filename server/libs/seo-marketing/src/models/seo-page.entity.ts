import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import { schema } from "./schema";
import { SeoDomain } from "./seo-domain.entity";
import { SeoCampanha } from "./seo-campanha.entity";
import { SeoKeyWord } from "./seo-key-word.entity";

export class SeoIssue {
    @ApiProperty() codigo: string;
    @ApiProperty({ enum: ['CRITICO', 'ALERTA', 'INFO'] }) severidade: 'CRITICO' | 'ALERTA' | 'INFO';
    @ApiProperty() mensagem: string;
}

@Entity({ schema })
export class SeoPage extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true }) url?: string;
    // ---- Resultado da última auditoria on-page ----
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true }) titulo?: string;
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true, type: 'text' }) metaDescription?: string;
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true }) canonical?: string;
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true }) statusHttp?: number;
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true }) indexavel?: boolean;
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true }) tempoRespostaMs?: number;
    @ApiProperty({ nullable: true, required: false, description: '0..100' }) @Column({ nullable: true }) score?: number;
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true, type: 'timestamp' }) ultimaAuditoria?: Date;
    @ApiProperty({ nullable: true, required: false, type: SeoIssue, isArray: true })
    @Column({ nullable: true, type: 'jsonb' }) issues?: SeoIssue[];
    // ---- Relacionamentos ----
    @ApiProperty({ nullable: true, required: false, type: () => SeoDomain })
    @ManyToOne(() => SeoDomain, { nullable: true, onDelete: 'SET NULL' })
    dominio?: SeoDomain;
    @ApiProperty({ nullable: true, required: false, type: () => SeoCampanha })
    @ManyToOne(() => SeoCampanha, { nullable: true, onDelete: 'SET NULL' })
    campanha?: SeoCampanha;
    @ApiProperty({ nullable: true, required: false, type: () => SeoKeyWord, isArray: true })
    @ManyToMany(() => SeoKeyWord)
    @JoinTable({ schema })
    palavrasChave?: SeoKeyWord[];
}
