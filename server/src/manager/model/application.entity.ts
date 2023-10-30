import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Application {
    @ApiProperty({ nullable: true, required: false, uniqueItems: true })
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @ApiProperty({ nullable: true, required: false })
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
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true, type: 'varchar', array: true })
    roles?: string[];
}