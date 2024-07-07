import { FullAuditedEntity } from "@ci/manager";
import { Column, Entity } from "typeorm";

@Entity({ schema: 'marketing' })
export class Page extends FullAuditedEntity {
    @Column({ nullable: true }) url?: string;
}