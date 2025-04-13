import { Column, Entity } from "typeorm";
import { schema } from "./schema";
import { Post } from "./post.entity";
import { ApiProperty } from "@nestjs/swagger";
export class PostmetaValue {
    @ApiProperty({ nullable: true, required: false })
    raw?: string;
}
@Entity({
    schema
})
export class Postmeta {
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true }) post: Post;
    key?: string;
    @ApiProperty({ nullable: true, required: false }) @Column({ type: 'jsonb' })
    value?: PostmetaValue;
}