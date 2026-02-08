import { Column, Entity, OneToMany } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "@ci/auth/models/user.entity";

@Entity({
    schema
})
export class EzPlayer extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true }) publicPlayerName?: string;
    @OneToMany(() => User, 'player') user?: User;
}