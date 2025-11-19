import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { JobStatus } from "./job-status";
import { SourceDefinition } from "./source-definition";
import { BuildEnvironment } from "./build-environment.entity";
import { Artifact } from "./artifact.entity";
import { FullAuditedEntity } from "@ci/manager";
import { schema } from "./schema";
@Entity({ schema })
export class BuildJob extends FullAuditedEntity {
    @PrimaryGeneratedColumn("uuid")
    jobId?: string;
    @CreateDateColumn()
    createdAt?: Date;
    @Column({
        type: "simple-enum",
        enum: JobStatus,
        default: JobStatus.PENDING
    })
    status?: JobStatus;
    @OneToOne(() => SourceDefinition, { cascade: true })
    @JoinColumn()
    source?: SourceDefinition;
    @OneToOne(() => BuildEnvironment, { cascade: true })
    @JoinColumn()
    environment?: BuildEnvironment;
    @OneToOne(() => Artifact, (artifact) => artifact.job, { cascade: true, nullable: true })
    @JoinColumn()
    artifact?: Artifact;
    @Column({ nullable: true })
    processingNodeId?: string; // Qual nó pegou este job
}