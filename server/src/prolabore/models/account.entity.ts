import { FullAuditedEntity } from "src/core/dao";
import { Entity } from "typeorm";

@Entity()
export class Account extends FullAuditedEntity {
    
}