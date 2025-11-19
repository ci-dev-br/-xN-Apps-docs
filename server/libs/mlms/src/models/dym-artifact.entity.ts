import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { DyMBuildJob } from "./dym-build-job.entity";
import { FullAuditedEntity } from "@ci/manager";
import { schema } from "./schema";
@Entity({ schema })
export class DyMArtifact extends FullAuditedEntity {
    @Column()
    storageLocation?: string; // URL ou Path
    @Column()
    checksum?: string; // SHA256
    @Column("simple-json", { nullable: true })
    metadata?: any;
    @OneToOne(() => DyMBuildJob, (job) => job.artifact)
    job?: "BuildJob";
}