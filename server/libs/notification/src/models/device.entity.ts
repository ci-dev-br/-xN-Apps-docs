import { Column, CreateDateColumn, Entity, JoinTable, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { PhoneNumber } from "./phone-number.entity";
import { schema } from "./schema";
@Entity({
    schema
})
export class Device {
    @ApiProperty({ nullable: true })
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @ApiProperty({ nullable: true })
    @Column({ nullable: true, unique: true })
    mac?: string;
    @ApiProperty({ nullable: true })
    @Column({ nullable: true })
    type?: string;
    @ApiProperty({ nullable: true, type: PhoneNumber, isArray: true })
    @OneToMany(() => PhoneNumber, type => type.device)
    @JoinTable()
    numbers?: PhoneNumber[];
    @ApiProperty({})
    @CreateDateColumn({})
    createdAt?: Date;
    @ApiProperty({})
    @UpdateDateColumn()
    changedAt?: Date;
    @ApiProperty({ type: PhoneNumber, isArray: true })
    @OneToMany(() => PhoneNumber, pn => pn.device)
    phones?: PhoneNumber[];
}