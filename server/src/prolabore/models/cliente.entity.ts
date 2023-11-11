import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/auth/models/user.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Cliente {
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @ApiProperty()
    @Column({})
    user?: User;
    @ApiProperty()
    @Column({})
    sobre?: string;
    @ApiProperty()
    @Column({})
    clienteAssas: string;
}