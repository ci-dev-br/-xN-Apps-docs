import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/***
 *  Agente de execução é a camada em que o código será executado
 */
@Entity({ schema: 'codex' })
export class Agent {
    @ApiProperty({})
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @ApiProperty({})
    @Column({})
    friendlyName?: string;
}