import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Document {
    @ApiProperty() @PrimaryGeneratedColumn('uuid')
    id?: string;
    @ApiProperty({ nullable: true }) @Column({ nullable: true })
    title?: string;
    @ApiProperty({ nullable: true }) @Column({ nullable: true })
    description?: string;
    @ApiProperty({ nullable: true }) @Column({ nullable: true, length: 2048 })
    checkSun?: string;
}