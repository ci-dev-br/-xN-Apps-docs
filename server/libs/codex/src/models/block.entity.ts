import { Column, Entity } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
/**
 * Bloco de Construção
 */
@Entity({ schema })
export class Block extends FullAuditedEntity {
    @ApiProperty({})
    @Column({ nullable: true })
    name?: string;
    @ApiProperty({})
    @Column({ nullable: true })
    lang?: string;
    @ApiProperty({})
    @Column({ nullable: true })
    code?: string;
}