import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class User {
    @ApiProperty({ required: false, nullable: true })
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @Column({ unique: true })
    @ApiProperty({ required: false, nullable: true })
    username?: string;
    @ApiProperty({ required: false, nullable: true })
    @Column({ nullable: true })
    fullName?: string;
    @Column({ nullable: true })
    @ApiProperty({ required: false, nullable: true })
    password?: string;
    @Column({ nullable: true, unique: true })
    @ApiProperty({ required: false, nullable: true })
    email?: string;
    @Column({ nullable: true })
    @ApiProperty({ required: false, nullable: true })
    phone?: string;
}