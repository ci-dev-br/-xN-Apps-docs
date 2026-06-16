import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity } from "typeorm";
import { schema } from "./schema";
@Entity({
    schema
})
export class File extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: false, primary: true })
    version?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ type: 'bytea', nullable: true })
    data?: Buffer;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    relativePath?: string;
}