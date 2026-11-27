import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToOne } from "typeorm";
import { IconPack } from "./icon-pack.entity";

/**
 * Entidade de ícone vetorial SVG da aplicação
 */
@Entity()
export class Icon extends FullAuditedEntity {
    @ApiProperty({
        nullable: true,
        required: true,
        title: 'Código',
        description: 'Identificador único do ícone (usado em mat-icon [svgIcon] e no iconLoader).',
    })
    @Column({ nullable: false })
    code?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Nome',
        description: 'Nome legível do ícone.',
    })
    @Column({ nullable: true })
    name?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Descrição',
        description: 'Descrição semântica e orientações de uso do ícone.',
    })
    @Column({ nullable: true, type: 'text' })
    description?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Código do Pacote',
        description: 'Código do pacote ao qual o ícone pertence (ex: v2, v3, default).',
    })
    @Column({ nullable: true })
    packCode?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Conteúdo SVG',
        description: 'Markup XML/SVG sanitizado do ícone.',
    })
    @Column({ nullable: true, type: 'text' })
    svgContent?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'ViewBox',
        description: 'Atributo viewBox do SVG (ex: 0 0 160 160 ou 0 0 24 24).',
        default: '0 0 160 160',
    })
    @Column({ nullable: true, default: '0 0 160 160' })
    viewBox?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Categoria',
        description: 'Categoria visual do ícone (App, Ação, Sistema, Navegação, UI).',
    })
    @Column({ nullable: true })
    category?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Tipo de Uso',
        description: 'Finalidade principal: app, action, both ou ui.',
        default: 'app',
    })
    @Column({ nullable: true, default: 'app' })
    usageType?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Caminho do Asset',
        description: 'Caminho relativo nos assets públicos (ex: icons/v2/codex.svg).',
    })
    @Column({ nullable: true })
    assetPath?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Tags',
        description: 'Palavras-chave de pesquisa do ícone.',
        type: String,
        isArray: true,
    })
    @Column({ nullable: true, type: 'varchar', array: true })
    tags?: string[];

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Apps Vinculados',
        description: 'Chaves dos aplicativos que utilizam este ícone.',
        type: String,
        isArray: true,
    })
    @Column({ nullable: true, type: 'varchar', array: true })
    linkedApps?: string[];

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Ações Vinculadas',
        description: 'Identificadores das ações da interface que utilizam este ícone.',
        type: String,
        isArray: true,
    })
    @Column({ nullable: true, type: 'varchar', array: true })
    linkedActions?: string[];

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Pacote',
        description: 'Pacote de ícones associado.',
        type: () => IconPack,
    })
    @ManyToOne(() => IconPack, pack => pack.icons, { nullable: true, onDelete: 'SET NULL' })
    pack?: IconPack;
}
