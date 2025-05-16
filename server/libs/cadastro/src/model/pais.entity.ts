import { Column, Entity } from "typeorm";
import { schema } from "./schema";
import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/manager";

/**
 * Cadastro de Países
 * 
 */
@Entity({ schema })
export class Pais extends FullAuditedEntity {
    @ApiProperty({ title: 'Códifo IBGE' })
    @Column({ nullable: true })
    ibgeCode?: string;
    @ApiProperty({ title: 'Nome Internacional' })
    @Column({ nullable: true })
    internationaName?: string;
    @ApiProperty({ title: 'Nome' }) @Column({ nullable: true })
    nome?: string;
    @ApiProperty({ title: 'Referências Externas' })
    @Column({ nullable: true, array: true, type: 'varchar' })
    referenciasExternas?: string[];
}   