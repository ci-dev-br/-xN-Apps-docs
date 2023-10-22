import { User } from "src/auth/models/user.entity";
import { Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Conversation {
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @JoinTable()
    @ManyToMany(() => User)
    participants: User[];
}