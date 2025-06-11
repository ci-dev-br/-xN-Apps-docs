import { Column, Entity } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Terms like Wordpress CMS
 * 
 */
@Entity({ schema })
export class Term extends FullAuditedEntity {
    @ApiProperty({ title: 'Nome' }) @Column({ nullable: true }) name?: string;
    @ApiProperty({ title: 'Slug' }) @Column({ nullable: true }) slug?: string;
    @ApiProperty({ title: 'Grupo de Termos' }) @Column({ nullable: true }) termGroup?: string;
}