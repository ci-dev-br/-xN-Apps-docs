import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { BuildJob } from "./build-job.entity";
import { FullAuditedEntity } from "@ci/manager";
import { schema } from "./schema";
@Entity({ schema })
export class Artifact extends FullAuditedEntity {
    @PrimaryGeneratedColumn("uuid")
    id?: string;
    @Column()
    storageLocation?: string; // URL ou Path
    @Column()
    checksum?: string; // SHA256
    @Column("simple-json", { nullable: true })
    metadata?: any;
    @OneToOne(() => BuildJob, (job) => job.artifact)
    job?: "BuildJob";
}