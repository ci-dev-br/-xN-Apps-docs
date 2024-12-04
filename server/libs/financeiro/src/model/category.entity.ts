import { FullAuditedEntity } from "@ci/core";
import { Column, Entity } from "typeorm";
import { schema } from "../norms";
import { ApiProperty } from "@nestjs/swagger";
@Entity({
    schema
})
export class Category extends FullAuditedEntity {
    @ApiProperty({
        title: 'Nome'
    })
    @Column({})
    name?: string;
    @ApiProperty({
        title: 'Descrição'
    })
    @Column({ nullable: true })
    description?: string;
}