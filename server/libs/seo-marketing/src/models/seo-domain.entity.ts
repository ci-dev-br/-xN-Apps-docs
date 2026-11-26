import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity } from "typeorm";
import { schema } from "./schema";
/**
 * Domínio monitorado pelo time de SEO.
 * Raiz da hierarquia: Domínio -> Páginas / Palavras-chave / Campanhas / Tarefas.
 */
@Entity({ schema })
export class SeoDomain extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false, title: 'Nome' })
    @Column({ nullable: true })
    nome?: string;
    @ApiProperty({ nullable: true, required: false, title: 'Hostname' })
    @Column({ nullable: true })
    hostname: string;
    @ApiProperty({ nullable: true, required: false, isArray: true, type: String })
    @Column({ nullable: true, array: true, type: 'varchar' })
    ipsHandShake: string[];
    @ApiProperty({ nullable: true, required: false, title: 'Propriedade verificada (Search Console)' })
    @Column({ nullable: true, default: false })
    verificado?: boolean;
    @ApiProperty({ nullable: true, required: false, title: 'URL do sitemap.xml' })
    @Column({ nullable: true })
    sitemapUrl?: string;
}
