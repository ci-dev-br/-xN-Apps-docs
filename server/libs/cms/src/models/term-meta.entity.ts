import { Column, Entity, ManyToOne } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Term } from "./term.entity";

/**
 * 
 */
@Entity({ schema })
export class TermMeta extends FullAuditedEntity {
    @ApiProperty({
        nullable: true, required: false
    })
    @Column({
        nullable: true
    })
    metaId?: string;
    @ApiProperty({
        nullable: true, required: false, type: Term,
    })
    @ManyToOne(() => Term)
    term?: Term;
    @ApiProperty({ title: 'Chave', nullable: true, required: false })
    @Column({
        nullable: true
    })
    key?: string;
    @ApiProperty({ title: 'Valor', nullable: true, required: false })
    @Column({
        nullable: true
    })
    value?: string;
}