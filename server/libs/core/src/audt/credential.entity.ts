import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, TableForeignKey } from "typeorm";
import { Application } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
// import { User } from "@ci/auth/models/user.entity";
import { schema } from "../schema";
@Entity(
    {
        schema
    }
)
export class Credential {
    @ApiProperty({ required: false }) @PrimaryGeneratedColumn('uuid') id?: string;
    @ApiProperty({ required: false }) @Column({ nullable: true }) identifiedUser?: string;
    @ApiProperty({ required: false }) @CreateDateColumn() createdAt?: Date;
    @ApiProperty({ required: false }) @ManyToMany(() => Application) @JoinTable() application?: Application;
    @ApiProperty({ required: false }) @Column({ nullable: true }) createdFromIp?: string;
    @Column({ nullable: true, default: false }) valid?: boolean;
    @Column({ nullable: true, default: false }) alive?: boolean;
    @Column({ nullable: true }) refreshToken?: string;
    @ApiProperty({ required: false, nullable: true })
    user?: any;
}