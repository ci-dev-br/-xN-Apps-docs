import { Column, CreateDateColumn, DeleteDateColumn, Entity, UpdateDateColumn } from "typeorm";
import { schema } from "./schema";
import { ApiProperty } from "@nestjs/swagger";
import { BasicIdentifiedEntity } from "@ci/manager";
@Entity({ schema })
export class Register extends BasicIdentifiedEntity {
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true }) mail?: string;
    @ApiProperty({ nullable: true, required: false }) @CreateDateColumn({ nullable: true }) createdAt?: Date;
    @ApiProperty({ nullable: true, required: false }) @UpdateDateColumn({ nullable: true }) modifiedAt?: Date;
    @ApiProperty({ nullable: true, required: false }) @DeleteDateColumn({ nullable: true }) deletedAt?: Date;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    emailAuthorization?: boolean;
}