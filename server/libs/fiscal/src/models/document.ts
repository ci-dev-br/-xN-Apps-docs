import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/core";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Attachment } from "./attachment.entity";

@Entity()
export class Document extends FullAuditedEntity {
    @ApiProperty({ nullable: true }) @Column({ nullable: true })
    title?: string;
    @ApiProperty({ nullable: true }) @Column({ nullable: true })
    description?: string;
    @ApiProperty({ nullable: true }) @Column({ nullable: true, length: 2048 })
    hash?: string;
    @ManyToMany(() => Attachment)
    attachements?: Attachment[];
}