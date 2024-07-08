import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
@Entity({ schema: 'codex' })
export class Termo {
    @PrimaryGeneratedColumn('uuid') internalRef;
    @ApiProperty({ nullable: true, required: false }) @Column() evidence: string;
    @ApiProperty({ nullable: true, required: false }) @Column() categorization: string;
    @ApiProperty({ nullable: true, required: false }) @Column() examples: string[];
}