import { ApiProperty } from "@nestjs/swagger";
import { User } from "@ci/auth/models/user.entity";
import { DaoFullAuditedServiceBase, FullAuditedEntity } from "@ci/core";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import { schema } from "./schema";
@Entity({
    schema,
})
export class Website extends FullAuditedEntity {
    @ApiProperty({
        title: 'Atributos',
        nullable: true, required: false
    })
    @Column({ type: 'jsonb', nullable: true })
    atributes: { [atributeCodename: string]: string };
    @ApiProperty({
        nullable: true, required: false, title: 'Nome'
    })
    @Column({ nullable: true })
    name?: string;
    @ApiProperty({ nullable: true, required: false, title: 'Domínio' })
    @Column({ nullable: true })
    domain?: string;
    @ApiProperty({ nullable: true, required: false, title: 'Theme' })
    @Column({ nullable: true })
    theme?: string;
    @ApiProperty({ nullable: true, required: false, isArray: true, title: 'Módulos' })
    @Column({ type: 'varchar', array: true, nullable: true })
    modules?: string[];
    @ApiProperty({ nullable: true, required: false, type: User, title: 'Administrador' })
    @ManyToOne(type => User)
    admin?: User;
    @ApiProperty({ nullable: true, required: false, type: User, isArray: true, title: 'Usuários Autorizados' })
    @ManyToMany(type => User)
    @JoinTable()
    users?: User[];
}