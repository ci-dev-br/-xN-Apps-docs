import { Entity } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";

@Entity({ schema })
export class Comment extends FullAuditedEntity {

}