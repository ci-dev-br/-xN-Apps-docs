import { Request } from '@nestjs/common';
import { Pessoa } from "@ci/cadastro";
import { Column, Entity, ManyToMany, OneToMany } from "typeorm";
import { schema } from "../norms";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
/***
 * Pessoa física ou jurídica que possui uma ou mais contas
 */
@Entity({
    schema
})
export class ClienteFinanceiro extends FullAuditedEntity {
    @ApiProperty({ title: 'Cadastro de Pessoa', nullable: true, required: false })
    @ManyToMany(t => Pessoa) pessoa?: Pessoa;
    @ApiProperty({ title: 'Nome de tratamento do Cliente', nullable: true, required: false })
    @Column({ nullable: true })
    nomeTratamento?: string;
    @ApiProperty({ title: 'CNPJ ou CPF', nullable: true, required: false })
    @Column({ nullable: true })
    cnpjOuCpf?: string;
    @ApiProperty({ title: 'Endereço para Contato', nullable: true, required: false })
    @Column({ nullable: true })
    endereço?: string;
    @ApiProperty({ title: 'Telefone para contato', nullable: true, required: false })
    @Column({ nullable: true })
    telefone?: string;
    @ApiProperty({ title: 'E-mail para contato', nullable: true, required: false })
    @Column({ nullable: true })
    email?: string;
}