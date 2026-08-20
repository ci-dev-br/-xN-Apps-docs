import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";

@Entity({ schema })
export class StorageCollection extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    title?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    description?: string;
}