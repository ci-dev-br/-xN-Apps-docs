import { Column, Entity } from "typeorm";
import { schema } from "./schema";
import { SeoPost } from "./seo-post.entity";
import { ApiProperty } from "@nestjs/swagger";
export class PostmetaValue {
    @ApiProperty({ nullable: true, required: false })
    raw?: string;
}
@Entity({
    schema
})
export class SeoPostmeta {
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true }) post: SeoPost;
    key?: string;
    @ApiProperty({ nullable: true, required: false }) @Column({ type: 'jsonb' })
    value?: PostmetaValue;
}