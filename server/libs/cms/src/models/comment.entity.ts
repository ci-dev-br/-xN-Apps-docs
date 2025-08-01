import { Column, Entity, JoinTable, ManyToOne } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
import { Post } from "../cms.module";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ schema })
export class Comment extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    author: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    authorEmail: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    authorUrl: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    authorIp: string;
    @ManyToOne(() => Post)
    @JoinTable()
    post: Post;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    publishingAt: Date;
}