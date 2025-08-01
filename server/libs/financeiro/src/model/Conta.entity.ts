import { Column, Entity } from "typeorm";
import { schema } from "../norms";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
@Entity({ schema })
export class ContaFinanceira extends FullAuditedEntity {
    @ApiProperty({ title: 'Tipo de Conta', nullable: true, required: false })
    @Column({ nullable: true })
    tipoConta?: string;
    @ApiProperty({ title: 'Número', nullable: true, required: false })
    @Column({ nullable: true })
    numero?: string;
    @ApiProperty({ title: 'Saldo', nullable: true, required: false })
    @Column({ nullable: true })
    saldo?: string;
    @ApiProperty({ title: 'Data de Abertura', nullable: true, required: false })
    @Column({ nullable: true })
    dataAbertura?: string;
    @ApiProperty({ title: 'Status', nullable: true, required: false })
    @Column({ nullable: true })
    status?: string;
}