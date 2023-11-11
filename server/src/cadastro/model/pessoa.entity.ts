import { FullAuditedEntity } from "src/core/dao";
import { Entity, JoinTable, ManyToMany } from "typeorm";
import { Endereco } from "./endereco.entity";

@Entity()
export class Pessoa extends FullAuditedEntity {
    emailPessoal?: string;
    empresa?: string;
    @ManyToMany(() => Endereco)
    @JoinTable()
    endereco?: Endereco;
}