import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "src/core/dao";
import { ContaBancaria } from "src/prolabore/models/conta-bancaria.entity";
import { Column, Entity } from "typeorm";


/**
 * Lançamento 
 * 
 */
@Entity({
    schema: 'financial'
})
export class Lancamento extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true }) valor: number;
    conta: ContaBancaria;
}