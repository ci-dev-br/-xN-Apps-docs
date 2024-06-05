import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "src/core/dao";
import { Column, Entity } from "typeorm";

@Entity({
    schema: 'financial'
})
export class Lancamento extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true }) valor: number;
}