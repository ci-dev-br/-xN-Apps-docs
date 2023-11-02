import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Application } from "./application.entity";

@Entity()
export class Domain {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({})
    hostname?: string;
    @ManyToMany(() => Application) @JoinTable()
    aplications?: Application[];
}