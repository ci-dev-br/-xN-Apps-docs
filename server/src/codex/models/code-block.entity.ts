import { FullAuditedEntity } from "src/core/dao";
import { Column, Entity } from "typeorm";

@Entity()
export class CodeBlock extends FullAuditedEntity {
    @Column({ nullable: true })
    lang?: string;
    @Column({ nullable: true })
    code?: string;
}