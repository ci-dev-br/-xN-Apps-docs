import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { ApiProperty } from "@nestjs/swagger";

/**
 * 
 */
@Entity()
export class DeviceAuthenticated {
    @ApiProperty({})
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @ApiProperty({})
    @UpdateDateColumn()
    lastAuthenticationHandshake?: Date;
    @ApiProperty({})
    @OneToOne(() => User)
    @JoinColumn()
    user?: User;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    refreshToken?: string;
}