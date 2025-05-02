import { Column, Entity, PrimaryColumn } from "typeorm";
import { schema } from "./schema";
import { ApiProperty } from "@nestjs/swagger";

@Entity({
    schema
})
export class UnidadeMedida {
    @ApiProperty({ nullable: true, required: false, uniqueItems: true })
    @PrimaryColumn()
    internationalCode: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    name?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    description: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true, array: true })
    externalReferenceUrl: string[];
}   