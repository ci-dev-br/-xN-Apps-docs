import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Application } from "../../manager/model/application.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class ChaveAcesso {
    @ApiProperty({ required: false }) @PrimaryGeneratedColumn('uuid') id?: string;
    @ApiProperty({ required: false }) @Column({ nullable: true }) identifiedUser?: string;
    @ApiProperty({ required: false }) @CreateDateColumn() createdAt?: Date;
    @ApiProperty({ required: false }) @ManyToMany(() => Application) @JoinTable() application?: Application;
    @ApiProperty({ required: false }) @Column({ nullable: true }) createdFromIp?: string;
    @Column({ nullable: true, default: false }) valid?: boolean;
    @Column({ nullable: true, default: false }) alive?: boolean;

}