import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity } from "typeorm";

export class Pergunta {
    @ApiProperty({
        nullable: true,
        required: false
    })
    questao?: string;
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
export class Form extends FullAuditedEntity {
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