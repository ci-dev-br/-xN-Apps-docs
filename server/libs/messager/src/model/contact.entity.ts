import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { schema } from "../noms";
import { User } from "@ci/auth/models/user.entity";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
/**
 * Messger Contato
 * 
 */
@Entity({
    schema
})
export class Contact extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true }) friendlyName?: string;
    @ApiProperty({ nullable: true, required: false, default: null }) @ManyToMany(() => User) @JoinTable() InternalIndentifiedUserCredentials?: User;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true }) statusMessage?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true }) phoneNumber?: string;
}