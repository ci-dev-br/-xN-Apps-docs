import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    UpdateDateColumn
} from "typeorm";
import {
    schema
} from "./schema";
import {
    ApiProperty
} from "@nestjs/swagger";
import {
    BasicIdentifiedEntity
} from "@ci/manager";
/**
 * Registro de Tentativa de Cadastro
 * Contato Inicial por E-mail ou Telefone
 * para posterior verificação e criação de Conta de Usuário
 * 
 */
@Entity({
    schema
})
export class Register extends BasicIdentifiedEntity {
    /**
     * Nome do registro
     */
    @ApiProperty({
        nullable: true,
        required: false
    }) @Column({
        nullable: true
    }) phone?: string;
    /**
     * Endereço de e-mail do registro
     */
    @ApiProperty({
        nullable: true,
        required: false
    }) @Column({
        nullable: true
    }) mail?: string;
    /**
     * Data de criação do registro
     */
    @ApiProperty({
        nullable: true,
        required: false
    }) @CreateDateColumn({
        nullable: true
    }) createdAt?: Date;
    /**
     * Data de modificação do registro
     */
    @ApiProperty({
        nullable: true,
        required: false
    }) @UpdateDateColumn({
        nullable: true
    }) modifiedAt?: Date;
    /**
     * Data de exclusão do registro
     */
    @ApiProperty({
        nullable: true,
        required: false
    }) @DeleteDateColumn({
        nullable: true
    }) deletedAt?: Date;
    /**
     * Email autorizado para contato
     */
    @ApiProperty({
        nullable: true,
        required: false
    })
    @Column({
        nullable: true
    })
    emailAuthorization?: boolean;
    /***
     * Telefone autorizado para contato
     */
    @Column({
        nullable: true
    })
    phoneAuthorization?: boolean;
}