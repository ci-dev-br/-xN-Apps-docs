import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/core";
// import { ContaBancaria } from "@ci/prolabore/models/conta-bancaria.entity";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { schema } from "../norms";
// import { ContaFinanceira } from "./conta-financeira.entity";
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
        required: false
    })
    @Column({ nullable: true })
    valor?: number;
}