import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { schema } from "../noms";
import { User } from "@ci/auth/models/user.entity";
import { FullAuditedEntity } from "@ci/manager";

@Entity({
    schema
})
export class Contact extends FullAuditedEntity {
    @Column({ nullable: true }) friendlyName?: string;
    @ManyToMany(() => User) @JoinTable() User?: User;
    @Column({ nullable: true }) statusMessage?: string;
    @Column({ nullable: true }) phoneNumber?: string;
}