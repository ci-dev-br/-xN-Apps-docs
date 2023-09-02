import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Application {
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @Column({ nullable: true })
    url?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    icon?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    name?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    description?: string;
}