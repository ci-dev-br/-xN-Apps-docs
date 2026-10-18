import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity } from "typeorm";

@Entity({})
export class UserInteraction extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true }) tag?: string;
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true })
    value?: string;
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true })
    objectIdentification?: string;
}