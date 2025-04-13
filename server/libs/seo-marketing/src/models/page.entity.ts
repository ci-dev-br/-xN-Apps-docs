import { FullAuditedEntity } from "@ci/manager";
import { Column, Entity } from "typeorm";
import { schema } from "./schema";
@Entity({ schema })
export class Page extends FullAuditedEntity {
    @Column({ nullable: true }) url?: string;
}