import { ApiProperty } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { schema } from "./schema";
import { Servico } from "./servico";
import { FullAuditedEntity } from "@ci/manager";

@Entity({
    schema
})
export class Promocao extends FullAuditedEntity {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ maxLength: 255 })
    @Column({ length: 255 })
    nome: string;

    @ApiProperty({ type: 'string', nullable: true })
    @Column({ type: 'text', nullable: true })
    descricao?: string;

    @ApiProperty({ type: 'string', format: 'date', nullable: true })
    @Column({ type: 'date', nullable: true })
    data_inicio?: Date;

    @ApiProperty({ type: 'string', format: 'date', nullable: true })
    @Column({ type: 'date', nullable: true })
    data_fim?: Date;

    @ApiProperty({ type: 'number', format: 'float', nullable: true })
    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    desconto_percentual?: number;

    @ApiProperty({ type: 'number', format: 'float', nullable: true })
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    desconto_valor?: number;

    @ApiProperty({ type: 'string', nullable: true, description: 'Lista de IDs de serviços aplicáveis (separados por vírgula)' })
    @Column({ type: 'text', nullable: true })
    servicos_aplicaveis?: string; // Could be a relation table for better normalization

    @ManyToMany(() => Servico, (servico) => servico.promocoes)
    @JoinTable()
    servicos: Servico[];
}