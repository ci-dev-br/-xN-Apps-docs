import { User } from "src/auth/models/user.entity";
import { FullAuditedEntity } from "src/core/dao";
import { Column, Entity, JoinTable, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Cliente } from "./cliente.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ schema: 'prolabore' })
export class Payment extends FullAuditedEntity {
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