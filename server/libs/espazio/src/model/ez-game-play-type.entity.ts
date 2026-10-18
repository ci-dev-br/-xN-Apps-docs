import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity } from "typeorm";
import { schema } from "./schema";

@Entity({ schema })
export class EzGamePalayType extends FullAuditedEntity {
    @ApiProperty({
        nullable: true, required: false
    }) @Column({ nullable: true })
    name?: string;
    @ApiProperty({
        nullable: true, required: false
    }) @Column({ nullable: true })
    description?: string;
}