import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Domain } from "./domain.entity";

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
    @ApiProperty({ nullable: true, required: false })
    @ManyToMany(() => Domain)
    domain?: Domain;
    @ApiProperty({ nullable: true, required: false })
    @Column({ default: 'global', length: 13 })
    menuGroupName: string;
}