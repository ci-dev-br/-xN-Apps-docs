import { FullAuditedEntity } from "@ci/manager";
import { Column, Entity } from "typeorm";
import { schema } from "./schema";
@Entity({ schema })
export class DyMSourceDefinition extends FullAuditedEntity {
    @Column()
    repoUrl?: string;
    @Column()
    commitHash?: string;
    @Column({ nullable: true })
    branch?: string;
}