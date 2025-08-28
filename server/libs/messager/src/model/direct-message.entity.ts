import { User } from "@ci/auth/models/user.entity";
import { Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Conversation } from "./conversation.entity";
import { schema } from "../noms";
import { FullAuditedEntity } from "@ci/manager";
import { Contact } from "./contact.entity";
import { ApiProperty } from "@nestjs/swagger";
/***
 *  Direct Message Default Entity
 * 
 */
@Entity({
    schema
})
export class DirectMessage extends FullAuditedEntity {
    @ApiProperty({ type: Contact })
    @JoinTable()
    @ManyToOne(() => Contact)
    from?: Contact;
    @ApiProperty({ type: Contact })
    @JoinTable()
    @ManyToOne(() => Contact)
    to?: Contact;
    @JoinTable()
    @ManyToOne(() => Conversation)
    conversation?: Conversation;
}