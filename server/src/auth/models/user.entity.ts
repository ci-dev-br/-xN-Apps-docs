import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @Column({ unique: true })
    @ApiProperty({ nullable: true })
    username?: string;
    @Column({ nullable: true })
    @ApiProperty({ nullable: true })
    password?: string;
    @Column({ nullable: true, unique: true })
    @ApiProperty({ nullable: true })
    email?: string;
    @Column({ nullable: true })
    @ApiProperty({ nullable: true })
    phone?: string;
}