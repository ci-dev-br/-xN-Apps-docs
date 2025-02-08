import { FullAuditedEntity } from "@ci/core";
import { Column, Entity } from "typeorm";
import { schema } from "./schema";

@Entity({ schema })
export class CodeBlock extends FullAuditedEntity {
    @Column({ nullable: true })
    lang?: string;
    @Column({ nullable: true })
    code?: string;

}