import { Column, Entity } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
export interface BlockSpecification {
    version: string;
    name: string;
}
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
    @Column({ nullable: true, type: 'jsonb' })
    code?: BlockSpecification;
}