import { Entity } from "typeorm";

@Entity({ schema: 'Financeiro' })
export class Conta {
    tipoConta?: string;
    numero?: string;
    saldo?: string;
    dataAbertura?: string;
    status?: string;
}