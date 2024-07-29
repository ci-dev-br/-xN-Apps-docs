import { FullAuditedEntity } from "@ci/core";
import { Column, Entity } from "typeorm";

@Entity({ schema: 'codex' })
export class CodeBlock extends FullAuditedEntity {
    @Column({ nullable: true })
    lang?: string;
    @Column({ nullable: true })
    code?: string;

}