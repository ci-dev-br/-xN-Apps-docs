import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity } from 'typeorm'

@Entity()
export class Banco{
    @ApiProperty({ nullable: false, required: true, uniqueItems: true})
    @Column({  unique: true, nullable: false })
    code: string;
    @ApiProperty({ nullable: true })
    @Column({ nullable: true })
    descricao: string;
}