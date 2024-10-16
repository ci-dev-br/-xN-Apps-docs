import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { Application } from "./application.entity";
import { ApiProperty } from "@nestjs/swagger";
import { schema } from "../noms";
import { FullAuditedEntity } from "../dao";

@Entity({ schema })
export class Domain extends FullAuditedEntity {
    @ApiProperty({
        title: 'Hostname',
        required: false, nullable: true
    })
    @Column({ length: 38 })
    hostname?: string;
    @ApiProperty({
        title: 'Aplicações correspondentes ao domínio',
        required: false, nullable: true, type: Application, isArray: true
    })
    @ManyToMany(() => Application)
    @JoinTable()
    aplications?: Application[];
    @ApiProperty({
        title: 'Domínio verificado',
        nullable: true, required: false
    }) @Column({ nullable: true })
    varified?: boolean;
}