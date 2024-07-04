import { FullAuditedEntity } from "src/core/dao";
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