import { FullAuditedEntity } from "@ci/manager";
import { Entity } from "typeorm";

@Entity({ schema: 'marketing' })
export class BackLink extends FullAuditedEntity {
    
}