import { Column, Entity, JoinTable, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { PhoneNumber } from "./phone-number.entity";

@Entity({
    schema: 'notification'
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
    @OneToMany(() => PhoneNumber, type => type.device)
    @JoinTable()
    numbers?:PhoneNumber[];    
}