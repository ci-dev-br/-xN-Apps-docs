import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @Column({ unique: true })
    username?: string;
    @Column({ nullable: true })
    password?: string;
    @Column({ nullable: true })
    email?: string;
    @Column({ nullable: true })
    phone?: string;
}