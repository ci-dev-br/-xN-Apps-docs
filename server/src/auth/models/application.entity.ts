import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Application {
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @Column({ nullable: true })
    url?: string;
}