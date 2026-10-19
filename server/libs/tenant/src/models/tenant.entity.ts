import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

/**
 * Entidade Tenant: Representa a fronteira de inquilino/compartilhamento de dados.
 */
@Entity()
export class Tenant {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @ApiProperty({ nullable: true, description: 'Identificador / Nome do Tenant' })
    @Column({ nullable: true })
    name?: string;

    @ApiProperty({ nullable: true, description: 'Descrição' })
    @Column({ nullable: true, type: 'text' })
    descriptions?: string;

    @ApiProperty({ nullable: true, description: 'Criador do Tenant' })
    @Column({ nullable: true })
    createdBy?: string;

    @ApiProperty({ nullable: true })
    @CreateDateColumn()
    createdAt?: Date;

    @ApiProperty({ nullable: true })
    @UpdateDateColumn()
    updatedAt?: Date;
}