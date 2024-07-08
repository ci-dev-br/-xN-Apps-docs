import { FullAuditedEntity } from "@ci/core";
import { Entity } from "typeorm";

@Entity({ schema: 'prolabore' })
export class Account extends FullAuditedEntity {

}