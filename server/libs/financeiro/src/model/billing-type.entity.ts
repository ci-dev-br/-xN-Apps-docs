import { Column, Entity, PrimaryColumn } from "typeorm";
import { schema } from "../norms";
import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/manager";
/**
 * Represents a billing type entity in the system.
 * This entity includes properties such as code and description.
 */
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