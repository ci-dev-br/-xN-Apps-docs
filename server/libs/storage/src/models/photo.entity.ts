import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/core";
import { Column, Entity } from "typeorm";
import { schema } from "./schema";
@Entity({
    schema
})
export class Photo extends FullAuditedEntity {
    /*  @ApiProperty({ nullable: true, required: false })
     @PrimaryGeneratedColumn('uuid')
     id?: string; */
    @ApiProperty({ nullable: true, required: false })
    @Column({ type: 'bytea' })
    originalFile?: Buffer;
}