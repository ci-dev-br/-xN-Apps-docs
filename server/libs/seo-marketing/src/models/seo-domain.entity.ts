import { FullAuditedEntity } from "@ci/manager";
import { Column, Entity } from "typeorm";
@Entity({ schema: 'marketing' })
export class SeoDomain extends FullAuditedEntity {
    @Column({ nullable: true })
    hostname: string;
    @Column({ nullable: true, array: true })
    ipsHandShake: string[];
} 