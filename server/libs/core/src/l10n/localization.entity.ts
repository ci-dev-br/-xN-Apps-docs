import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Credential } from "../audt";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { schema } from "../shema";
@Entity({
    schema
})
export class Localization extends FullAuditedEntity {
    @ApiProperty({ type: Credential })
    @ManyToOne(t => Credential, c => null, { persistence: true })
    @JoinColumn()
    chaveAcesso?: Credential;
    @Column({ nullable: true }) latitude?: number;
    @Column({ nullable: true }) longitude?: number;
    @CreateDateColumn() time?: Date;
} 