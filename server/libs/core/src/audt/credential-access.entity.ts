import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { schema } from "../schema";
import { Credential } from "./credential.entity";
export class HeaderInfo {
    [key: string]: any;
}
@Entity({
    schema
})
export class CredentialAccess {
    @PrimaryGeneratedColumn('uuid') internalId?: string;
    @ManyToOne(() => Credential) credential?: Credential;
    @ApiProperty({ nullable: true, required: false }) @Column({ type: 'jsonb', nullable: true })
    header?: HeaderInfo;
}