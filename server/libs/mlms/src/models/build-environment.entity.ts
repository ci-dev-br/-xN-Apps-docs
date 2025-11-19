import { FullAuditedEntity } from "@ci/manager";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { schema } from "./schema";
@Entity({ schema })
export class BuildEnvironment extends FullAuditedEntity {
    @PrimaryGeneratedColumn("uuid")
    id?: string;
    @Column()
    language?: string; // ex: "typescript", "rust"
    @Column()
    compilerVersion?: string; // ex: "1.0.0"
    @Column("simple-json")
    envVariables?: Record<string, string>;
}