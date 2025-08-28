import { User } from "@ci/auth/models/user.entity";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { schema } from "../noms";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Contact } from "./contact.entity";
@Entity({ schema })
export class Conversation extends FullAuditedEntity {
    @ApiProperty({
        type: Conversation,
        isArray: true,
    })
    @JoinTable()
    @ManyToMany(() => Contact)
    @JoinTable()
    participants?: Contact[];
    @ApiProperty({ title: 'Títutlo', nullable: true, required: false })
    @Column({ nullable: true })
    title?: string;
}