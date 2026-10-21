import { FullAuditedEntity } from "@ci/manager";
import { Column, Entity, ManyToOne } from "typeorm";
import { schema } from "./schema";
import { ApiProperty } from "@nestjs/swagger";
import { SeoDomain } from "./seo-domain.entity";
/**
 * Campanha
 */
@Entity({ schema })
export class SeoCampanha extends FullAuditedEntity {
    @Column({ nullable: true }) @ApiProperty({ nullable: true, required: false }) nome: string;
    @Column({ nullable: true }) @ApiProperty({ nullable: true, required: false }) objetivo?: string;
    @Column({ nullable: true, default: 'PLANEJADA' })
    @ApiProperty({ nullable: true, required: false, enum: ['PLANEJADA', 'ATIVA', 'PAUSADA', 'CONCLUIDA'] })
    status?: string;
    @Column({ nullable: true, type: 'timestamp' }) @ApiProperty({ nullable: true, required: false }) inicio?: Date;
    @Column({ nullable: true, type: 'timestamp' }) @ApiProperty({ nullable: true, required: false }) fim?: Date;
    @ApiProperty({ nullable: true, required: false, type: () => SeoDomain })
    @ManyToOne(() => SeoDomain, { nullable: true, onDelete: 'SET NULL' })
    dominio?: SeoDomain;
}
