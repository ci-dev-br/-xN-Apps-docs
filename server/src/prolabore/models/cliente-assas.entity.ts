import { Column, Entity, JoinTable, OneToMany, OneToOne } from "typeorm";
import { Cliente } from "./cliente.entity";
import { ContaBancaria } from "./conta-bancaria.entity";
import { FullAuditedEntity } from "src/core/dao";

/**
 * 
 * https://docs.asaas.com/docs/criando-um-cliente
 */
@Entity()
export class ClienteAssas extends FullAuditedEntity {
    @OneToOne(() => Cliente, cliente => cliente.clienteAssas)
    cliente?: Cliente;
    customer?: string;
    /*
     * informações de pessoa
     */
    @Column({})
    name?: string;
    @Column({})
    cpfCnpj?: string;
    @Column({})
    mobilePhone?: string;

    @OneToMany(() => ContaBancaria, contaBancaria => contaBancaria.id)
    @JoinTable()
    contaBancaria?: ContaBancaria[];
}