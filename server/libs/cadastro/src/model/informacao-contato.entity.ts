import { FullAuditedEntity } from "@ci/core";
import { Entity } from "typeorm";
import { schema } from "./schema";

/**
 * Informação de Contato
 */
@Entity({ schema })
export class InformacaoContato extends FullAuditedEntity {

}