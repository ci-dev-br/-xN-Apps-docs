import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToOne } from "typeorm";
import { schema } from "./schema";
import { SeoPage } from "./seo-page.entity";

/**
 * Marketing - SEO - Link de Retorno - registra o link de retorno e um link recebido dentro do sistema.
 */
@Entity({ schema })
export class SeoBackLink extends FullAuditedEntity {
    @ApiProperty({
        nullable: true,
        required: false,
        title: 'URL de Destino',
        description: 'URL de destino (página do domínio)',
    })
    @Column({ nullable: true })
    enderecoRetorno?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'URL de Origem',
        description: 'URL externa que aponta para o domínio',
    })
    @Column({ nullable: true })
    origemUrl?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Texto Âncora',
        description: 'Texto clicável do link externo',
    })
    @Column({ nullable: true })
    ancora?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Atributo Rel',
        description: 'Tipo de relação do link (dofollow, nofollow, ugc, sponsored)',
        enum: ['dofollow', 'nofollow', 'ugc', 'sponsored'],
        default: 'dofollow',
    })
    @Column({ nullable: true, default: 'dofollow' })
    rel?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Ativo',
        description: 'Indica se o backlink está ativo e verificado',
        default: true,
    })
    @Column({ nullable: true, default: true })
    ativo?: boolean;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Página de Destino',
        description: 'Página SEO vinculada ao backlink',
        type: () => SeoPage,
    })
    @ManyToOne(() => SeoPage, { nullable: true, onDelete: 'SET NULL' })
    pagina?: SeoPage;
}
