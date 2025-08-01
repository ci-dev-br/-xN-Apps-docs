import { FullAuditedEntity } from "@ci/manager";
import { Column, Entity } from "typeorm";
import { schema } from "../noms";
@Entity({ schema })
export class Chamada extends FullAuditedEntity {
    @Column({ nullable: true })
    status?: string;
}