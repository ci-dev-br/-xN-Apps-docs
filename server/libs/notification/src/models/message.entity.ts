import { Column, CreateDateColumn, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PhoneNumber } from "./phone-number.entity";
import { ApiProperty } from "@nestjs/swagger";
import { schema } from "./schema";
@Entity({
    schema
})
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @ManyToOne(type => PhoneNumber)
    @ApiProperty({ nullable: true, required: false })
    @JoinTable()
    from?: PhoneNumber;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    to?: string;
    @ApiProperty({ nullable: true, required: false })
    @CreateDateColumn()
    createdAt?: Date;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    sent?: boolean;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    textMessage?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    htmlMessage?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    metadata?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ default: 'sms', nullable: true })
    type?: string;
}