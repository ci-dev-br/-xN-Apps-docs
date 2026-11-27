import { Column, Entity, ManyToOne } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Website } from "./website.entity";
import { TermTaxonomy } from "./cms-enums";

/**
 * Terms like Wordpress CMS (categorias, tags e menus de navegação)
 */
@Entity({ schema })
export class Term extends FullAuditedEntity {
    @ApiProperty({
        title: 'Nome',
        description: 'Nome de exibição do termo ou categoria',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    name?: string;

    @ApiProperty({
        title: 'Slug',
        description: 'Identificador amigável para URL',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    slug?: string;

    @ApiProperty({
        title: 'Taxonomia',
        description: 'Classificação do termo (category, tag, nav_menu)',
        enum: TermTaxonomy,
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, default: TermTaxonomy.CATEGORY })
    taxonomy?: string;

    @ApiProperty({
        title: 'Grupo de Termos',
        description: 'Agrupamento lógico do termo',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    termGroup?: string;

    @ApiProperty({
        title: 'Descrição',
        description: 'Descrição detalhada do termo ou categoria',
        format: 'textarea',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, type: 'text' })
    description?: string;

    @ApiProperty({
        title: 'Website',
        description: 'Website associado ao termo',
        type: () => Website,
        nullable: true,
        required: false,
    })
    @ManyToOne(() => Website)
    website?: Website;
}
