import { ApiProperty } from "@nestjs/swagger";
/* import { FullAuditedEntity } from "@ci/core";
 */import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { schema } from "./schema";
/* import { Tenant } from "@ci/tenant"; */
import { Exclude } from "class-transformer";
@Entity({
    schema
})
export class Photo {
    @ApiProperty({
        nullable: true,
        required: false,
        uniqueItems: true,
        readOnly: true
    })
    @PrimaryGeneratedColumn('uuid')
    internalId?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ type: 'bytea' })
    originalFile?: Buffer;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    format?: string;
}