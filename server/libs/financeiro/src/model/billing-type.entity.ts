import { Column, Entity, PrimaryColumn } from "typeorm";
import { schema } from "../norms";
import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/manager";
@Entity({
    schema
})
export class BillingType extends FullAuditedEntity {
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