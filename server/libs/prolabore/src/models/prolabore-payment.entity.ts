import { User } from "@ci/auth/models/user.entity";
import { FullAuditedEntity } from "@ci/core";
import { Column, Entity, JoinTable, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Cliente } from "./cliente.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ schema: 'prolabore' })
export class ProlaborePayment extends FullAuditedEntity {
    @ApiProperty({ nullable: true })
    @OneToOne(() => Cliente)
    @JoinTable()
    customer?: Cliente;
    @ApiProperty({ nullable: true })
    @Column({ nullable: true })
    amount?: number;
    @ApiProperty({ nullable: true })
    @Column({ nullable: true })
    description?: string;
}