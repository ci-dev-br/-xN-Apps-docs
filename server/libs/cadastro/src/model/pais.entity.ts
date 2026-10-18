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
    @ApiProperty({ title: 'Código IBGE', nullable: true, required: false })
    @Column({ nullable: true })
    ibgeCode?: string;
    @ApiProperty({ title: 'Nome Internacional', nullable: true, required: false })
    @Column({ nullable: true })
    internationaName?: string;
    @ApiProperty({ title: 'Nome', nullable: true, required: false }) @Column({ nullable: true })
    nome?: string;
    @ApiProperty({ title: 'Referências Externas', nullable: true, required: false })
    @Column({ nullable: true, array: true, type: 'varchar' })
    referenciasExternas?: string[];
}   