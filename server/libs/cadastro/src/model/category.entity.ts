import { FullAuditedEntity } from "@ci/core";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity } from "typeorm";
import { schema } from "./schema";
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