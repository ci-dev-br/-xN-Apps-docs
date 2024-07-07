import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Painel {
    @ApiProperty({ nullable: true, required: false, uniqueItems: true })
    @PrimaryGeneratedColumn('uuid')
    internalId?: string;

    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    endpoint?: string;
}