import { FullAuditedEntity } from "@ci/core";
import { Entity } from "typeorm";

@Entity({ schema: 'prolabore' })
export class Receipt extends FullAuditedEntity {
}