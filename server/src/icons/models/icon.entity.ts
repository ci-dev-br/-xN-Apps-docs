import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryColumn } from "typeorm";

/**
 * Entidade de ícone da aplicação
 */
@Entity()
export class Icon {
    @PrimaryColumn({
    })
    name?: string;
    /* @ApiProperty({
        nullable: true,
    }) */
    /* @Column({ type: 'bytea', nullable: true })
    data?: Buffer; */
}