import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { schema } from "./schema";

/***
 *  Agente de execução é a camada em que o código será executado
 */
@Entity({ schema })
export class Agent {
    @ApiProperty({})
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @ApiProperty({})
    @Column({})
    friendlyName?: string;
}