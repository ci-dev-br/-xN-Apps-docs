import { ApiProperty } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { schema } from "./schema";
import { Cliente } from "./cliente";
import { FullAuditedEntity } from "@ci/manager";

@Entity({ schema })
export class CampanhaMarketing extends FullAuditedEntity {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ maxLength: 255 })
    @Column({ length: 255 })
    nome: string;

    @ApiProperty({ type: 'string', format: 'date', nullable: true })
    @Column({ type: 'date', nullable: true })
    data_inicio?: Date;

    @ApiProperty({ type: 'string', format: 'date', nullable: true })
    @Column({ type: 'date', nullable: true })
    data_fim?: Date;

    @ApiProperty({ type: 'string', nullable: true })
    @Column({ type: 'text', nullable: true })
    descricao?: string;

    @ApiProperty({ type: 'string', nullable: true })
    @Column({ type: 'text', nullable: true })
    publico_alvo?: string;

    @ApiProperty({ enum: TipoCampanha })
    @Column({ type: 'enum', enum: TipoCampanha })
    tipo: TipoCampanha;

    @ManyToMany(() => Cliente, (cliente) => cliente.campanhasMarketing)
    @JoinTable()
    clientes: Cliente[];
}