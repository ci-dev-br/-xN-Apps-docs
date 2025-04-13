import { User } from "@ci/auth/models/user.entity";
import { Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { schema } from "../noms";
import { FullAuditedEntity } from "@ci/manager";
@Entity({ schema })
export class Conversation extends FullAuditedEntity {
    @JoinTable()
    @ManyToMany(() => User)
    participants: User[];
}