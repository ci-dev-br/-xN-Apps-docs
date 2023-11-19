import { FullAuditedEntity } from "src/core/dao";
import { Entity } from "typeorm";

@Entity({ schema: 'prolabore' })
export class Account extends FullAuditedEntity {

}