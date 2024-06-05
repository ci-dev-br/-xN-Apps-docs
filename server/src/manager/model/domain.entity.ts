import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Application } from "./application.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class Domain {
    @ApiProperty({ uniqueItems: true, required: false, nullable: true })
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @ApiProperty({ required: false, nullable: true })
    @Column({ length: 38 })
    hostname?: string;
    @ApiProperty({ required: false, nullable: true, type: Application, isArray: true })
    @ManyToMany(() => Application) @JoinTable()
    aplications?: Application[];
}