import { Column, Entity, ManyToOne } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Website } from "./website.entity";

/**
 * Configurações chave-valor do portal CMS (equivalente a wp_options)
 */
@Entity({ schema })
export class SiteOption extends FullAuditedEntity {
    @ApiProperty({
        title: 'Nome da Opção',
        description: 'Chave identificadora da configuração',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    optionName?: string;

    @ApiProperty({
        title: 'Valor da Opção',
        description: 'Valor serializado ou textual da configuração',
        format: 'textarea',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, type: 'text' })
    optionValue?: string;

    @ApiProperty({
        title: 'Carregamento Automático',
        description: 'Indica se a opção é carregada automaticamente no bootstrap do site',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, default: true })
    autoload?: boolean;

    @ApiProperty({
        title: 'Descrição',
        description: 'Descrição da finalidade desta opção',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    description?: string;

    @ApiProperty({
        title: 'Website',
        description: 'Website associado à configuração (opcional para opções globais)',
        type: () => Website,
        nullable: true,
        required: false,
    })
    @ManyToOne(() => Website)
    website?: Website;
}
