import { User } from "src/auth/models/user.entity";
import { Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Conversation } from "./conversation.entity";

@Entity()
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    from: User;
    @ManyToOne(() => Conversation,)
    conversation?: Conversation;
}