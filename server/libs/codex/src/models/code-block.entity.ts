import { FullAuditedEntity } from "@ci/core";
import { Column, Entity } from "typeorm";
import { schema } from "./schema";
import { ApiProperty } from "@nestjs/swagger";
@Entity({ schema })
export class CodeBlock extends FullAuditedEntity {
    @ApiProperty({
        title: 'Linguagem'
    })
    @Column({ nullable: true })
    language?: string;
    @ApiProperty({
        title: 'Linguagem'
    })
    @Column({ nullable: true })
    sourceCode?: string;
    @ApiProperty({
        title: 'Versão'
    })
    @Column({ nullable: true })
    version?: string;
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true })
    description?: string;
}