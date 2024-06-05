import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "src/core/dao";
import { Column, Entity } from "typeorm";
@Entity()
export class Marca extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    name?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true, unique: true })
    code?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    description?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    siteUrl?: string;
}