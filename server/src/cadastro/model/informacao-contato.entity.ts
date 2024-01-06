import { FullAuditedEntity } from "src/core/dao";
import { Entity } from "typeorm";

/**
 * 
 */
@Entity({ schema: 'cadastro' })
export class InformacaoContato extends FullAuditedEntity {
    
}