import { ApiProperty } from "@nestjs/swagger";
import { User } from "@ci/auth/models/user.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ schema: 'prolabore' })
export class Autonomo {
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    user?: User;
    @ApiProperty()
    @Column({})
    cpfCnpj?: string;
    @ApiProperty()
    @Column({})
    rg?: string;
    @ApiProperty()
    @Column({})
    rgOrgaoEmissor?: string;
}