import { Column, Entity } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
@Entity({
    schema,
})
export class WorkItem extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true })
    code?: number;
}
