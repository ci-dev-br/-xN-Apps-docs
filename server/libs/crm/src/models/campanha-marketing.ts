import { ApiProperty } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { schema } from "./schema";
import { ClienteCrm } from "./cliente";
import { FullAuditedEntity } from "@ci/manager";
import { TipoCampanha } from "./tipo-campanha";

@Entity({ schema })
export class CampanhaMarketing extends FullAuditedEntity {

    @ApiProperty({ maxLength: 255 })
    @Column({ length: 255 })
    nome: string;

    @ApiProperty({ type: 'string', format: 'date', nullable: true })
    @Column({ type: 'date', nullable: true })
    dataInicio?: Date;

    @ApiProperty({ type: 'string', format: 'date', nullable: true })
    @Column({ type: 'date', nullable: true })
    dataFim?: Date;

    @ApiProperty({ type: 'string', nullable: true })
    @Column({ type: 'text', nullable: true })
    descricao?: string;

    @ApiProperty({ type: 'string', nullable: true })
    @Column({ type: 'text', nullable: true })
    publicoAlvo?: string;

    @ApiProperty({ enum: TipoCampanha })
    @Column({ type: 'enum', enum: TipoCampanha })
    tipo: TipoCampanha;

    @ManyToMany(() => ClienteCrm, (cliente) => cliente.campanhasMarketing)
    @JoinTable()
    clientes: ClienteCrm[];
}