import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, OneToMany } from "typeorm";
import { Icon } from "./icon.entity";

/**
 * Pacote de ícones da aplicação (agrupa ícones SVG para apps e ações vinculadas)
 */
@Entity()
export class IconPack extends FullAuditedEntity {
    @ApiProperty({
        nullable: true,
        required: true,
        title: 'Código do Pacote',
        description: 'Identificador único do pacote de ícones (ex: v2, v3, gerencial, custom).',
    })
    @Column({ nullable: false })
    code?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Nome',
        description: 'Nome amigável do pacote de ícones.',
    })
    @Column({ nullable: true })
    name?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Descrição',
        description: 'Descrição da finalidade e estilo visual do pacote.',
    })
    @Column({ nullable: true, type: 'text' })
    description?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Versão',
        description: 'Versão semântica do pacote de ícones.',
        default: '1.0.0',
    })
    @Column({ nullable: true, default: '1.0.0' })
    version?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Caminho Base',
        description: 'Pasta base nos assets públicos (ex: icons/v2).',
    })
    @Column({ nullable: true })
    basePath?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Ativo',
        description: 'Indica se o pacote está ativo para registro automático no cliente.',
        default: true,
    })
    @Column({ nullable: true, default: true })
    isActive?: boolean;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Padrão',
        description: 'Indica se é o pacote padrão da aplicação.',
        default: false,
    })
    @Column({ nullable: true, default: false })
    isDefault?: boolean;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Apps Destino',
        description: 'Lista de chaves de aplicativos vinculados a este pacote.',
        type: String,
        isArray: true,
    })
    @Column({ nullable: true, type: 'varchar', array: true })
    targetApps?: string[];

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Ações Vinculadas',
        description: 'Identificadores de ações da interface vinculados a este pacote.',
        type: String,
        isArray: true,
    })
    @Column({ nullable: true, type: 'varchar', array: true })
    linkedActions?: string[];

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Ícones',
        description: 'Ícones pertencentes ao pacote.',
        type: () => Icon,
        isArray: true,
    })
    @OneToMany(() => Icon, icon => icon.pack)
    icons?: Icon[];
}
