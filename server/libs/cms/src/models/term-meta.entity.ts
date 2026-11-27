import { Column, Entity, ManyToOne } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Term } from "./term.entity";

/**
 * Metadados adicionais vinculados a um Termo CMS
 */
@Entity({ schema })
export class TermMeta extends FullAuditedEntity {
    @ApiProperty({
        title: 'ID do Metadado',
        description: 'Identificador auxiliar do metadado',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    metaId?: string;

    @ApiProperty({
        title: 'Termo',
        description: 'Termo relacionado',
        type: () => Term,
        nullable: true,
        required: false,
    })
    @ManyToOne(() => Term)
    term?: Term;

    @ApiProperty({
        title: 'Chave',
        description: 'Chave do metadado',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true })
    key?: string;

    @ApiProperty({
        title: 'Valor',
        description: 'Valor do metadado',
        format: 'textarea',
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, type: 'text' })
    value?: string;
}
