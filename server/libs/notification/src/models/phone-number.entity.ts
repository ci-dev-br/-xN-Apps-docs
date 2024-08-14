import { ApiProperty } from "@nestjs/swagger";
import { CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm";
import { Device } from "./device.entity";
import { ManagerModule } from "@ci/manager";

@Entity({
    schema: 'notification'
})
export class PhoneNumber {
    @ApiProperty({ type: Device })
    @ManyToOne(() => Device)
    @JoinTable()
    device?: Device;
    @PrimaryColumn()
    number?: string;
    @CreateDateColumn()
    createdAt?: Date;
}