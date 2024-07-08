import { FullAuditedEntity } from "@ci/core";
import { Entity } from "typeorm";

@Entity({ schema: 'codex' })
export class Lexico extends FullAuditedEntity {

}