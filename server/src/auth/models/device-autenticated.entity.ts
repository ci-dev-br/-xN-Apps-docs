import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class DeviceAuthenticated {
    @ApiProperty({})
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @ApiProperty({})
    @Column()
    lastAuthenticationHandshake?: Date;
    @ApiProperty({})
    @OneToOne(() => User)
    @JoinColumn()
    user?: User;
}