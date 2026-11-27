import { Column, Entity, ManyToOne } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Website } from "./website.entity";

/**
 * Links externos, redirecionamentos e URLs gerenciadas pelo CMS
 */
@Entity({ schema })
export class Links extends FullAuditedEntity {
    @ApiProperty({ title: 'URL', description: 'URL de destino do link', format: 'url', nullable: true, required: false })
    @Column({ nullable: true })
    url?: string;

    @ApiProperty({ title: 'Nome', description: 'Título ou rótulo do link', nullable: true, required: false })
    @Column({ nullable: true })
    name?: string;

    @ApiProperty({ title: 'Slug / Atalho', description: 'Identificador curto para redirecionamento', nullable: true, required: false })
    @Column({ nullable: true })
    slug?: string;

    @ApiProperty({ title: 'Imagem', description: 'URL da imagem ou ícone associado', format: 'url', nullable: true, required: false })
    @Column({ nullable: true })
    image?: string;

    @ApiProperty({ title: 'Target', description: 'Alvo de abertura (_blank, _self)', nullable: true, required: false })
    @Column({ nullable: true })
    target?: string;

    @ApiProperty({ title: 'Descrição', description: 'Descrição do link ou redirecionamento', format: 'textarea', nullable: true, required: false })
    @Column({ nullable: true })
    description?: string;

    @ApiProperty({ title: 'Visível', description: 'Define se o link está visível publicamente (Y/N)', nullable: true, required: false })
    @Column({ nullable: true })
    visible?: string;

    @ApiProperty({ title: 'Proprietário', description: 'Responsável pelo link', nullable: true, required: false })
    @Column({ nullable: true })
    owner?: string;

    @ApiProperty({ title: 'Classificação', description: 'Prioridade ou avaliação do link', nullable: true, required: false })
    @Column({ nullable: true })
    rating?: string;

    @ApiProperty({ title: 'Atualização', description: 'Referência da última atualização', nullable: true, required: false })
    @Column({ nullable: true })
    update?: string;

    @ApiProperty({ title: 'Rel (XFN)', description: 'Atributo rel de SEO/relacionamento (nofollow, noopener)', nullable: true, required: false })
    @Column({ nullable: true })
    rel?: string;

    @ApiProperty({ title: 'Notas', description: 'Anotações internas sobre o link', format: 'textarea', nullable: true, required: false })
    @Column({ nullable: true })
    notes?: string;

    @ApiProperty({ title: 'RSS', description: 'URL do feed RSS associado', format: 'url', nullable: true, required: false })
    @Column({ nullable: true })
    rss?: string;

    @ApiProperty({ title: 'Cliques', description: 'Contagem de acessos ao link', type: 'integer', nullable: true, required: false })
    @Column({ nullable: true, default: 0, type: 'int4' })
    clicks?: number;

    @ApiProperty({ title: 'Website', description: 'Website associado ao link', type: () => Website, nullable: true, required: false })
    @ManyToOne(() => Website)
    website?: Website;
}
