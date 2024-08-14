import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    schema: 'notification'
})
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @Column({ nullable: true })
    form?: string;
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