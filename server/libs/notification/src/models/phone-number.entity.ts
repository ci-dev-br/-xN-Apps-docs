import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm";
import { Device } from "./device.entity";
import { ManagerModule } from "@ci/manager";

@Entity({
    schema: 'notification'
})
export class PhoneNumber {
    @ApiProperty({ type: Device })
    @ManyToOne(() => Device, {})
    @JoinTable()
    device?: Device;
    @PrimaryColumn()
    deviceId: string;
    @Column({ nullable: true })
    number?: string;
    @CreateDateColumn()
    createdAt?: Date;
    @ApiProperty({}) @Column({ type: 'int', nullable: true })
    @PrimaryColumn()
    subscriptionId?: number;
    @ApiProperty() @Column({ nullable: true })
    carrierName?: string;
}