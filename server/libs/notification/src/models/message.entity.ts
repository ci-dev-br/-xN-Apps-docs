import { Column, CreateDateColumn, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PhoneNumber } from "./phone-number.entity";

@Entity({
    schema: 'notification'
})
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @ManyToOne(type => PhoneNumber)
    @JoinTable()
    from?: PhoneNumber;
    @Column({ nullable: true })
    to?: string;
    @CreateDateColumn()
    createdAt?: Date;
    @Column({ nullable: true })
    sent?: boolean;
    @Column({ nullable: true })
    textMessage?: string;
    @Column({ nullable: true })
    htmlMessage?: string;
    @Column({ nullable: true })
    metadata?: string;
}