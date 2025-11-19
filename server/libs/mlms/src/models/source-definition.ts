import { FullAuditedEntity } from "@ci/manager";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { schema } from "./schema";
@Entity({ schema })
export class SourceDefinition extends FullAuditedEntity {
    @PrimaryGeneratedColumn("uuid")
    id?: string;
    @Column()
    repoUrl?: string;
    @Column()
    commitHash?: string;
    @Column({ nullable: true })
    branch?: string;
}