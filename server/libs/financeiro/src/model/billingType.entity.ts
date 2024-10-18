import { Column, Entity, PrimaryColumn } from "typeorm";
import { schema } from "../norms";
import { ApiProperty } from "@nestjs/swagger";
@Entity({
    schema
})
export class BillingType {
    @ApiProperty({
        title: 'Código'
    })
    @PrimaryColumn()
    code?: string;
    @ApiProperty({
        title: 'Descrição'
    })
    @Column()
    descricao?: string;
}