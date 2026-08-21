import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { Application } from "./application.entity";
import { ApiProperty } from "@nestjs/swagger";
import { schema } from "../noms";
import { FullAuditedEntity } from "../dao/entities";

/**
 * Domínio da Aplicação
 * 
 * Esta entidade representa um domínio associado a uma ou mais aplicações dentro do sistema.
 * Ela contém informações sobre o hostname do domínio, as aplicações correspondentes a esse domínio e se o domínio foi verificado ou não.
 * 
 * Os domínios são usados para organizar e gerenciar as aplicações, permitindo que elas sejam acessadas por meio de endereços URL específicos.  
 */
@Entity({ schema })
export class Domain extends FullAuditedEntity {
    @ApiProperty({
        title: 'Hostname',
        required: false, nullable: true
    })
    @Column({
        length: 512,
        nullable: true,
        //  unique: true ~> não gostei ...
    })
    hostname?: string;
    @ApiProperty({
        title: 'Aplicações correspondentes ao domínio',
        required: false,
        nullable: true,
        type: Application,
        isArray: true
    })
    @ManyToMany(() => Application)
    @JoinTable()
    aplications?: Application[];
    @ApiProperty({
        title: 'Domínio verificado',
        nullable: true,
        required: false
    }) @Column({ nullable: true })
    varified?: boolean;
}