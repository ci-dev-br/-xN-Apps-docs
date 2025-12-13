import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { DyMJobStatus } from "./dym-job-status";
import { DyMSourceDefinition } from "./dym-source-definition";
import { DyMBuildEnvironment } from "./dym-build-environment.entity";
import { DyMArtifact } from "./dym-artifact.entity";
import { FullAuditedEntity } from "@ci/manager";
import { schema } from "./schema";
@Entity({ schema })
export class DyMBuildJob extends FullAuditedEntity {
    @CreateDateColumn()
    createdAt?: Date;
    @Column({
        type: "simple-enum",
        enum: DyMJobStatus,
        default: DyMJobStatus.PENDING
    })
    status?: DyMJobStatus;
    @OneToOne(() => DyMSourceDefinition, { cascade: true })
    @JoinColumn()
    source?: DyMSourceDefinition;
    @OneToOne(() => DyMBuildEnvironment, { cascade: true })
    @JoinColumn()
    environment?: DyMBuildEnvironment;
    @OneToOne(() => DyMArtifact, (artifact) => artifact.job, { cascade: true, nullable: true })
    @JoinColumn()
    artifact?: DyMArtifact;
    @Column({ nullable: true })
    processingNodeId?: string; // Qual nó pegou este job
}