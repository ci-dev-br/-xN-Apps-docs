import { FullAuditedEntity } from "@ci/manager/dao/entities";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToOne } from "typeorm";
import { schema } from "./schema";
import { SeoDomain } from "./seo-domain.entity";
@Entity({ schema })
export class SeoKeyWord extends FullAuditedEntity {
    @ApiProperty({ required: false, nullable: true }) @Column({ nullable: true }) termo?: string;
    @ApiProperty({ required: false, nullable: true }) @Column({ nullable: true }) voulePesquisa?: number;
    @ApiProperty({ required: false, nullable: true }) @Column({ nullable: true }) dificuldadeClassificacao?: number;
    @ApiProperty({ required: false, nullable: true }) @Column({ nullable: true }) intencaoPesquisa?: number;
    @ApiProperty({ required: false, nullable: true, description: 'Posição atual no SERP' })
    @Column({ nullable: true }) posicaoAtual?: number;
    @ApiProperty({ required: false, nullable: true, description: 'Posição anterior no SERP' })
    @Column({ nullable: true }) posicaoAnterior?: number;
    @ApiProperty({ nullable: true, required: false, type: () => SeoDomain })
    @ManyToOne(() => SeoDomain, { nullable: true, onDelete: 'SET NULL' })
    dominio?: SeoDomain;
}
