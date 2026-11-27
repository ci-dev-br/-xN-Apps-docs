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
    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Nome',
        description: 'Nome identificador do domínio ou projeto SEO',
    })
    @Column({ nullable: true })
    nome?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Hostname',
        description: 'Hostname ou domínio principal (ex.: ci.dev.br)',
    })
    @Column({ nullable: true })
    hostname: string;

    @ApiProperty({
        nullable: true,
        required: false,
        isArray: true,
        type: String,
        title: 'IPs Handshake',
        description: 'Endereços IP associados ao domínio',
    })
    @Column({ nullable: true, array: true, type: 'varchar' })
    ipsHandShake: string[];

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Verificado (Search Console)',
        description: 'Indica se a propriedade está verificada no Search Console',
        default: false,
    })
    @Column({ nullable: true, default: false })
    verificado?: boolean;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'URL do Sitemap',
        description: 'Endereço completo do sitemap.xml',
    })
    @Column({ nullable: true })
    sitemapUrl?: string;
}
