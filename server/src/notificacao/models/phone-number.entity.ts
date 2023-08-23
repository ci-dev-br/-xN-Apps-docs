import { ApiProperty } from "@nestjs/swagger";
import { CreateDateColumn, Entity, ManyToMany, PrimaryColumn } from "typeorm";
import { Device } from "./device.entity";

@Entity()
export class PhoneNumber {
    @ApiProperty({ type: Device })
    @ManyToMany(() => Device)
    device?: Device;
    @PrimaryColumn()
    number?: string;
    @CreateDateColumn()
    createdAt?: Date;
}