import { FullAuditedEntity } from "@ci/core";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity } from "typeorm";
import { schema } from "./schema";
@Entity({
    schema
})
export class Category extends FullAuditedEntity {
    @ApiProperty({
        title: 'Nome',
        nullable: true,
        required: false,
    })
    @Column({})
    name?: string;
    @ApiProperty({
        title: 'Descrição',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    description?: string;
}