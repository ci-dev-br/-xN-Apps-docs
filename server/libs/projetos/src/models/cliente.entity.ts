import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
import { Endereco, Pessoa } from "@ci/cadastro";
import { ApiProperty } from "@nestjs/swagger";
/**
 * Cliente do Projeto
 */
@Entity({
    schema
})
export class Cliente extends FullAuditedEntity {
    @ApiProperty({ nullable: true })
    @Column({ nullable: true })
    nome?: string; //  (varchar): Nome completo do cliente (pessoa física ou jurídica).
    @ApiProperty({ nullable: true })
    @Column({ nullable: true })
    tipo?: string; //  (varchar): Tipo de cliente (pessoa física ou jurídica).
    @ApiProperty({ nullable: true })
    @Column({ nullable: true })
    documento?: string; //  (varchar): CPF ou CNPJ, dependendo do tipo de cliente.
    @ApiProperty({ nullable: true })
    @Column({ nullable: true })
    email?: string; //  (varchar): Endereço de e-mail do cliente.
    @ApiProperty({ nullable: true })
    @Column({ nullable: true })
    telefone?: string; //  (varchar): Número de telefone do cliente.
    @ApiProperty({ nullable: true })
    @ManyToMany(t => Endereco) @JoinTable()
    endereco?: Endereco[]; //  (varchar): Endereço completo do cliente (rua, número, bairro, cidade, estado, CEP).
    @ApiProperty({ type: Pessoa })
    @OneToMany(t => Pessoa, p => null)
    pessoaResponsavel?: Pessoa;
} 