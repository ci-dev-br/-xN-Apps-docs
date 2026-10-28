import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToOne } from "typeorm";
import { schema } from "./schema";
import { SeoPage } from "./seo-page.entity";
/**
 * Marketing - CRM - Link de Retorno - registra o link de rertorno e um link recebido dentro do sistema. O link de retorno permite registrar um retorno para disparo em determinadas automações.
 */
@Entity({ schema })
export class SeoBackLink extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false, description: 'URL de destino (página do domínio)' })
    @Column({ nullable: true })
    enderecoRetorno?: string;
    @ApiProperty({ nullable: true, required: false, description: 'URL externa que aponta para o domínio' })
    @Column({ nullable: true }) origemUrl?: string;
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true }) ancora?: string;
    @ApiProperty({ nullable: true, required: false, enum: ['dofollow', 'nofollow', 'ugc', 'sponsored'] })
    @Column({ nullable: true, default: 'dofollow' }) rel?: string;
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true, default: true }) ativo?: boolean;
    @ApiProperty({ nullable: true, required: false, type: () => SeoPage })
    @ManyToOne(() => SeoPage, { nullable: true, onDelete: 'SET NULL' })
    pagina?: SeoPage;
}
