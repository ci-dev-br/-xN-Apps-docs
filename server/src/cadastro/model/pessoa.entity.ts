import { FullAuditedEntity } from "src/core/dao";
import { Entity } from "typeorm";
import { Endereco } from "./endereco.entity";

@Entity()
export class Pessoa extends FullAuditedEntity {
    emailPessoal?: string;
    empresa?: string;
    endereco?: Endereco;
}