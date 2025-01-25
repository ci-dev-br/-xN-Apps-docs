import { FullAuditedEntity } from "@ci/manager";
import { Column, Entity } from "typeorm";
import { schema } from "./schema";
import { ApiProperty } from "@nestjs/swagger";
/**
 * Campanha
 */
@Entity({ schema })
export class Campanha extends FullAuditedEntity {
    @Column({ nullable: true }) @ApiProperty({ nullable: true, required: false }) nome: string;
    
}