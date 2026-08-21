import { Column, Entity } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
@Entity({ schema })
export class File extends FullAuditedEntity {
    @ApiProperty({
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    format?: string;
    @ApiProperty({
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, type: 'bytea' })
    data?: any;
    @ApiProperty({
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    title?: string;
    @ApiProperty({
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, type: 'jsonb' })
    metadata?: any;
}