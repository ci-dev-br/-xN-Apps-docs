import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Funcionario {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @ApiProperty({}) @Column({})
    nomeCompletoCadastrado?: string;
    @ApiProperty({}) @Column({})
    rg?: string;
    @ApiProperty({}) @Column({})
    cpf?: string;
    @ApiProperty({}) @Column({})
    dataCadastramento?: Date;
}