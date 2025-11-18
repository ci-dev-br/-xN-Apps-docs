import { FullAuditedEntity } from "@ci/core";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity } from "typeorm";
@Entity({ schema: 'INPI' })
export class Patente extends FullAuditedEntity {
    @ApiProperty({ description: 'Resumo técnico da patente' })
    @Column({ type: 'text' })
    resumoTecnico: string;
    @ApiProperty({
        description: 'Reivindicações da patente',
        type: [String],
    })
    @Column('simple-array')
    reivindicacoes: string[];
}