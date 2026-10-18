import { Column, Entity, PrimaryColumn } from "typeorm";
import { schema } from "./schema";
import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/manager";

@Entity({
    schema
})
export class UnidadeMedida extends FullAuditedEntity {
    @ApiProperty({ title: 'Código Internacional', nullable: true, required: false, uniqueItems: true })
    @Column({ nullable: false })
    internationalCode: string;
    @ApiProperty({ title: 'Nome', nullable: true, required: false })
    @Column({ nullable: true })
    name?: string;
    @ApiProperty({ title: 'Descrição', nullable: true, required: false })
    @Column({ nullable: true })
    description: string;
    @ApiProperty({ title: 'URL de Referência Externa', nullable: true, required: false })
    @Column({ nullable: true, type: 'varchar', array: true })
    externalReferenceUrl: string[];
}   