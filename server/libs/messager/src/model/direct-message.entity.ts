import { User } from "@ci/auth/models/user.entity";
import { Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Conversation } from "./conversation.entity";
import { schema } from "../noms";
import { FullAuditedEntity } from "@ci/manager";
@Entity({
    schema
})
export class DirectMessage extends FullAuditedEntity {
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @JoinTable()
    @ManyToOne(() => User)
    from?: User;
    @JoinTable()
    @ManyToOne(() => Conversation)
    conversation?: Conversation;
}