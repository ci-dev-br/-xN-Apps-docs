import { User } from "src/auth/models/user.entity";
import { Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Conversation } from "./conversation.entity";

@Entity()
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @JoinTable()
    @ManyToOne(() => User)
    from: User;
    @JoinTable()
    @ManyToOne(() => Conversation,)
    conversation?: Conversation;
}