import { FullAuditedEntity } from "@ci/core";
import { Column, Entity } from "typeorm";

@Entity({
    schema: 'financial'
})
export class Category extends FullAuditedEntity {
    @Column({})
    name?: string;
    @Column({ nullable: true })
    description?: string;
}