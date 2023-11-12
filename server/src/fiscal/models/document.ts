import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "src/core/dao";
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