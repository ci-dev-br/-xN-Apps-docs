import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { schema } from "../noms";

@Entity({ schema })
export class Categoria {
    @ApiProperty({ nullable: true, required: false, maxLength: 30 })
    @PrimaryColumn({ length: 30 })
    name?: string;
    @ApiProperty({ nullable: true, required: false, maxLength: 250 })
    @Column({ length: 250, nullable: true })
    description?: string;
    @Column({ length: 15, nullable: true })
    icon?: string;

    @ApiProperty({ nullable: true, required: false })
    @ManyToOne(type => Categoria, categoria => categoria.children)
    parent?: Categoria;

    @ApiProperty({ nullable: true, required: false })
    @OneToMany(type => Categoria, categoria => categoria.parent)
    children?: Categoria[];
}