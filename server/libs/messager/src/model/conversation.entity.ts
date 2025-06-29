import { User } from "@ci/auth/models/user.entity";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { schema } from "../noms";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
@Entity({ schema })
export class Conversation extends FullAuditedEntity {
    @ApiProperty({
        type: Conversation,
        isArray: true,
    })
    @JoinTable()
    @ManyToMany(() => User)
    @JoinTable()
    participants?: User[];
    @ApiProperty({ title: 'Títutlo', nullable: true, required: false })
    @Column({ nullable: true })
    title?: string;
}