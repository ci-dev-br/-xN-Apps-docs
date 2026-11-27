import { ApiProperty } from "@nestjs/swagger";
import { User } from "@ci/auth/models/user.entity";
import { FullAuditedEntity } from "@ci/core";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import { schema } from "./schema";

@Entity({
    schema,
})
export class Website extends FullAuditedEntity {
    @ApiProperty({
        title: 'Atributos',
        description: 'Metadados e atributos personalizados do website',
        nullable: true,
        required: false,
    })
    @Column({ type: 'jsonb', nullable: true })
    atributes?: { [atributeCodename: string]: string };

    @ApiProperty({
        title: 'Nome',
        description: 'Nome identificador do website ou portal',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    name?: string;

    @ApiProperty({
        title: 'Domínio',
        description: 'Domínio ou host público do website',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    domain?: string;

    @ApiProperty({
        title: 'Descrição',
        description: 'Descrição institucional do portal',
        format: 'textarea',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, type: 'text' })
    description?: string;

    @ApiProperty({
        title: 'Tema',
        description: 'Identificador do tema visual aplicado ao portal',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    theme?: string;

    @ApiProperty({
        title: 'Módulos',
        description: 'Lista de módulos ativos neste website',
        type: String,
        isArray: true,
        nullable: true,
        required: false,
    })
    @Column({ type: 'varchar', array: true, nullable: true })
    modules?: string[];

    @ApiProperty({
        title: 'Administrador',
        description: 'Usuário administrador principal do website',
        type: () => User,
        nullable: true,
        required: false,
    })
    @ManyToOne(() => User)
    admin?: User;

    @ApiProperty({
        title: 'Usuários Autorizados',
        description: 'Usuários com permissão de gestão de conteúdo',
        type: () => User,
        isArray: true,
        nullable: true,
        required: false,
    })
    @ManyToMany(() => User)
    @JoinTable()
    users?: User[];
}
