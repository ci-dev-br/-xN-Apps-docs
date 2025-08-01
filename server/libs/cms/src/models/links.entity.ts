import { Column, Entity } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ schema })
export class Links extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    url: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    name: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    image: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    target: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    description: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    visible: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    owner: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    rating: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    update: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    rel: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    notes: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    rss: string;
}