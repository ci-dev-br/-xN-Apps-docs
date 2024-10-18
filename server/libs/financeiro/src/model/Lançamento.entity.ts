import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/core";
import { ContaBancaria } from "@ci/prolabore/models/conta-bancaria.entity";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { schema } from "../norms";
import { Conta } from "./Conta.entity";
/**
 * Lançamento 
 */
@Entity({
    schema
})
export class Lancamento extends FullAuditedEntity {
    @ApiProperty({ title: 'Valor', nullable: true, required: false }) @Column({ nullable: true })
    valor?: number;
    @ApiProperty({ title: 'Conta', nullable: true, required: false }) @ManyToMany(t => Conta) @JoinTable()
    conta?: ContaBancaria;
}