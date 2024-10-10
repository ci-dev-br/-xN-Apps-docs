import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/core";
import { ContaBancaria } from "@ci/prolabore/models/conta-bancaria.entity";
import { Column, Entity } from "typeorm";

/**
 * Lançamento 
 */
@Entity({
    schema: 'financial'
})
export class Lancamento extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true }) valor: number;
    conta: ContaBancaria;
}