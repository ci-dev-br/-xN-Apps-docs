import { FullAuditedEntity } from "@ci/manager";
import { Column, Entity } from "typeorm";
import { schema } from "./schema";
import { ApiProperty } from "@nestjs/swagger";
/**
 * WebSite Page
 */
@Entity({
    schema,
})
export class SitePage extends FullAuditedEntity {
    @ApiProperty({
        title: 'Template',
        description: '',
    })
    @Column({
        nullable: true,
    })
    tempalte?: string;
    @ApiProperty({
        title: 'Conteúdo HTML', format: 'html', description: 'Conteúdo HTML da página'
    })
    @Column({
        nullable: true, array: true, type: 'varchar'
    })
    content?: string[];
    @ApiProperty({
        title: 'Endereço da página', format: 'html', description: 'Endereço público da página'
    })
    @Column({
        nullable: true,
    })
    urlMatch?: string;
}