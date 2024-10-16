import { FullAuditedEntity } from "@ci/core";
import { Entity } from "typeorm";

@Entity({schema: 'cadastro'})
export class Endereco extends FullAuditedEntity {
    /**
     * Logradouro
     */
    logradouro: string;
    /**
     * Endereço
     */
    address: string;
    /**
     * Número
     */
    addressNumber: string;
    /**
     * Complemento
     */
    complement: string;
    /**
     * Bairro
     */
    province: string;

}