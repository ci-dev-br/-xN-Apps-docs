import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Cliente } from "./cliente.entity";
import { ContaBancaria } from "./conta-bancaria.entity";
import { FullAuditedEntity } from "src/core/dao";
import { ApiProperty } from "@nestjs/swagger";

/**
 * 
 * https://docs.asaas.com/docs/criando-um-cliente
 */
@Entity({ schema: 'prolabore' })
export class ClienteAssas extends FullAuditedEntity {
    @ApiProperty({ nullable: true })
    @OneToOne(() => Cliente, cliente => cliente.clienteAssas)
    cliente?: Cliente;
    customer?: string;
    /*
     * informações de pessoa
    */
    @ApiProperty({ nullable: true })
    @Column({})
    name?: string;
    @ApiProperty({ nullable: true })
    @Column({})
    cpfCnpj?: string;
    @ApiProperty({ nullable: true })
    @Column({})
    mobilePhone?: string;

    @ApiProperty({ nullable: true })
    @ManyToOne(() => ContaBancaria)
    @JoinTable()
    contaBancaria?: ContaBancaria[];
}