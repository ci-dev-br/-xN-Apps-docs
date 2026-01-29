import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/core";
import { Column, Entity } from "typeorm";
import { schema } from "../norms";
/**
 * Represents a financial transaction entry in the system.
 * This entity includes properties such as value, account, and other financial details.
 */
@Entity({
    schema
})
export class LancamentoFinanceiro extends FullAuditedEntity {
    @ApiProperty({
        title: 'Valor',
        description: 'Valor incial de do Lançameto',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, type: 'numeric', precision: 20, scale: 2 })
    valor?: number;
}