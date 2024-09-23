import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity } from "typeorm";

@Entity({ schema: 'forms' })
export class Form extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true }) title?: string;
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true }) description?: string;
}