import { ApiProperty } from "@nestjs/swagger";
import { User } from "@ci/auth/models/user.entity";
import { Column, Entity, JoinTable, OneToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity({ schema: 'prolabore' })
export class Cliente {
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @ApiProperty()
    @OneToOne(() => User)
    @JoinTable()
    user?: User;
    @ApiProperty()
    @Column({})
    sobre?: string;
    @ApiProperty()
    @Column({})
    clienteAssas: string;
}