import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Domain } from "./domain.entity";
import { schema } from "../noms";
@Entity({ schema })
export class Application {
    @ApiProperty({ nullable: true, required: false, uniqueItems: true, title: 'Chave Interna', readOnly: true })
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @ApiProperty({ nullable: true, required: false, title: 'Endereço URL' })
    @Column({ nullable: true })
    url?: string;
    @ApiProperty({ nullable: true, required: false, title: 'Ícone' })
    @Column({ nullable: true })
    icon?: string;
    @ApiProperty({
        title: 'Nome',
        nullable: true, required: false
    })
    @Column({ nullable: true })
    name?: string;
    @ApiProperty({ nullable: true, required: false, title: 'Descrição' })
    @Column({ nullable: true })
    description?: string;
    @ApiProperty({ nullable: true, required: false, title: 'Papéis' })
    @Column({ nullable: true, type: 'varchar', array: true })
    roles?: string[];
    @ApiProperty({ nullable: true, required: false, title: 'Domínio' })
    @ManyToMany(() => Domain)
    domain?: Domain;
    @ApiProperty({ nullable: true, required: false, title: 'Grupo' })
    @Column({ default: 'global', length: 13 })
    menuGroupName: string;
    @ApiProperty({ nullable: true, required: false, title: 'Categoria' })
    @Column({ length: 30, nullable: true })
    categoria: string;
    @ApiProperty({
        title: 'Domínios Associados',
        type: Domain,
        isArray: true,
        nullable: true,
        required: false,
    })
    @ManyToMany(type => Domain, domain => domain.aplications)
    domains: Domain[]
}