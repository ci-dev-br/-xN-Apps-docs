import { FullAuditedEntity } from "@ci/core";
import { ApiProperty } from "@nestjs/swagger";
import {
    Column,
    Entity
} from "typeorm";
import { schema } from "./schema";
/**
 * Endereço 
 */
@Entity({ schema })

export class Endereco extends FullAuditedEntity {
    /**
     * Logradouro
     */
    @ApiProperty({
        title: 'Logradouro',
        nullable: true, required: false
    })
    @Column({
        nullable: true
    })
    logradouro?: string;
    /**
     * Endereço
     */
    @ApiProperty({
        title: 'Endereço',
        nullable: true,
        required: false
    })
    @Column({
        nullable: true
    })
    address?: string;
    /**
     * Número
     */
    @ApiProperty({
        title: 'Número',
        nullable: true,
        required: false
    })
    @Column({
        nullable: true
    })
    addressNumber?: string;
    /**
     * Complemento
     */
    @ApiProperty({
        title: 'Complemento',
        nullable: true,
        required: false
    })
    @Column({
        nullable: true
    })
    complement?: string;
    /**
     * Bairro
     */
    @ApiProperty({
        title: 'Município',
        nullable: true,
        required: false
    })
    @Column({
        nullable: true
    })
    province?: string;
}