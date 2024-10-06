import { Pessoa } from "@ci/cadastro";
import { Entity } from "typeorm";

/***
 * Pessoa física ou jurídica que possui uma ou mais contas
 */
@Entity({
    name: 'Financeiro'
})
export class Cliente {
    pessoa: Pessoa;
    nomeTratamento: string;
    cnpjOuCpf: string;
    endereço: string;
    telefone: string;
    email: string;
}