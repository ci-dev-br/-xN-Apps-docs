import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/auth/models/user.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
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