import { Column, Entity } from "typeorm";
import { schema } from "../norms";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
/**
 * Represents a financial transaction entity in the system.
 * This entity includes properties such as date, time, value, type, and description. 
 */
@Entity({ schema })
export class Transacao extends FullAuditedEntity {
    @ApiProperty({ title: 'Data', nullable: true, required: false })
    @Column({ nullable: true })
    data?: Date;
    @ApiProperty({ title: 'Hora', nullable: true, required: false })
    @Column({ nullable: true })
    hora?: Date;
    @ApiProperty({ title: 'Valor', nullable: true, required: false })
    @Column({ nullable: true })
    valor?: Date;
    @ApiProperty({ title: 'Tipo', nullable: true, required: false })
    @Column({ nullable: true })
    tipo?: 'C' | 'D';
    @ApiProperty({ title: 'Descrição', nullable: true, required: false })
    @Column({ nullable: true })
    descrição?: string;
}