import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { schema } from "../schema";
import { Credential } from "./credential.entity";

@Entity({
    schema
})
export class CredentialAccess {
    @PrimaryGeneratedColumn('uuid') internalId?: string;
    @ManyToOne(() => Credential) credential?: Credential;
    @ApiProperty({ nullable: true, required: false }) @Column({ type: 'jsonb', nullable: true })
    header?: any;
    @ApiProperty({ nullable: true, required: false }) @Index() @Column({ nullable: true, length: 96 }) cf_pseudo_ipv4?: string;
    @ApiProperty({ nullable: true, required: false }) @Index() @Column({ nullable: true, length: 96 }) cf_connecting_ip?: string;
    @ApiProperty({ nullable: true, required: false }) @Index() @Column({ nullable: true, length: 96 }) x_forwarded_for?: string;
    @ApiProperty({ nullable: true, required: false }) @CreateDateColumn() createdAt: Date;
}