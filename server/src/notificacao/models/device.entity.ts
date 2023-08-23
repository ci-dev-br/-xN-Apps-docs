import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class Device {
    @ApiProperty({})
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @ApiProperty({})
    @Column({ nullable: true, unique: true })
    mac?: string;
}