import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
import { Website } from "./website.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ schema })
export class SitePost extends FullAuditedEntity {
    @ApiProperty({ type: Website })
    @ManyToOne(() => Website)
    website?: Website;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    title?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    author?: string;
    @ApiProperty({ nullable: true, required: false, isArray: true, format: 'text-html' })
    @Column({ nullable: true, array: true, type: 'varchar' })
    content?: string[];
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    excerpt?: string;
    @ApiProperty({ nullable: true, required: false, enum: ['publish', 'draft', 'auto-draft'] })
    @Column({ nullable: true, enum: ['publish', 'draft', 'auto-draft'] })
    status?: string;
    @ApiProperty({ nullable: true, required: false, uniqueItems: true })
    @Column({ nullable: true, unique: true })
    guid?: string;
    @ApiProperty({ nullable: true, required: false, uniqueItems: true })
    @Column({ nullable: true, default: 0, type: 'inet4' })
    menuOrder?: number;
}