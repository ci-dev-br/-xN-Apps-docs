import { Column, Entity, PrimaryColumn } from "typeorm";
import { schema } from "./schema";
import { ApiProperty } from "@nestjs/swagger";
/**
 * Linguagem 
 * 
 * Permite cadastrar a linguagem para agrupar os Dicionários de acordo com a Linguagem definida.
 */
@Entity({ schema })
export class Language {
    @ApiProperty({ nullable: true, required: false }) @PrimaryColumn({ length: 8 })
    code: string;
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true })
    description?: string;
}