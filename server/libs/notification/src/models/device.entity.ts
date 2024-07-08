import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class Device {
    @ApiProperty({ nullable: true })
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @ApiProperty({ nullable: true })
    @Column({ nullable: true, unique: true })
    mac?: string;
    @ApiProperty({ nullable: true })
    @Column({ nullable: true })
    type?: string;
}