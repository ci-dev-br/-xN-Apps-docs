import { FullAuditedEntity } from "@ci/core";
import { Entity } from "typeorm";

/**
 * 
 */
@Entity({ schema: 'cadastro' })
export class InformacaoContato extends FullAuditedEntity {
    
}