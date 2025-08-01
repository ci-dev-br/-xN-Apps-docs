import { Column, Entity, PrimaryColumn } from "typeorm";
import { schema } from "./schema";
import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/manager";

@Entity({
    schema
})
export class UnidadeMedida extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false, uniqueItems: true })
    @Column({ nullable: false })
    internationalCode: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    name?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    description: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true, type: 'varchar', array: true })
    externalReferenceUrl: string[];
}   