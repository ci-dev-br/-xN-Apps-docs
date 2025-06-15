import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity } from "typeorm";
export class Option {
    @ApiProperty({
        nullable: true,
        required: false
    })
    label?: string;
    @ApiProperty({
        nullable: true,
        required: false
    })
    type?: string;
}
export class Pergunta {
    @ApiProperty({
        nullable: true,
        required: false
    })
    questao?: string;
    @ApiProperty({
        nullable: true,
        required: false
    })
    type?: string;
    @ApiProperty({
        nullable: true,
        required: false,
        type: Option,
        isArray: true,
    })
    options: Option[];
}
export class Perguntas {
    @ApiProperty({
        nullable: true,
        required: false,
        isArray: true,
        type: Pergunta,
    })
    perguntas?: Pergunta[];
}
@Entity({ schema: 'forms' })
export class Forms extends FullAuditedEntity {
    @ApiProperty({
        nullable: true,
        required: false
    }) @Column({ nullable: true })
    title?: string;
    @ApiProperty({
        nullable: true,
        required: false
    }) @Column({ nullable: true })
    description?: string;
    @ApiProperty({
        nullable: true,
        required: false, type: Perguntas,
    }) @Column({ nullable: true, type: 'jsonb' })
    perguntas?: Perguntas;
}