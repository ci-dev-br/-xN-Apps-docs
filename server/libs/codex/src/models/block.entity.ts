import { Column, Entity } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";

export interface BlockNodeItem {
    id: string;
    componentName: string;
    label?: string;
    inputs?: Record<string, any>;
    children?: BlockNodeItem[];
    order?: number;
}

export interface BlockSpecification {
    version: string;
    name: string;
    route?: string;
    layout?: string;
    blocks?: BlockNodeItem[];
    metadata?: Record<string, any>;
}

/**
 * Bloco de Construção de Tela Dinâmica
 */
@Entity({ schema })
export class Block extends FullAuditedEntity {
    @ApiProperty({
        required: false,
        nullable: true,
        title: 'Nome',
        description: 'Nome identificador do bloco ou tela dinâmica',
    })
    @Column({ nullable: true })
    name?: string;

    @ApiProperty({
        required: false,
        nullable: true,
        title: 'Linguagem',
        description: 'Linguagem ou formato da especificação do bloco (ex: dynamic-blocks-json)',
    })
    @Column({ nullable: true })
    lang?: string;

    @ApiProperty({
        required: false,
        nullable: true,
        title: 'Rota',
        description: 'Rota da aplicação relacionada a esta tela em blocos',
    })
    @Column({ nullable: true })
    route?: string;

    @ApiProperty({
        required: false,
        nullable: true,
        title: 'Descrição',
        description: 'Descrição da finalidade da tela ou bloco',
    })
    @Column({ nullable: true })
    description?: string;

    @ApiProperty({
        required: false,
        nullable: true,
        title: 'ID da Aplicação',
        description: 'ID da aplicação cadastrada associada a este bloco',
    })
    @Column({ nullable: true })
    applicationId?: string;

    @ApiProperty({
        required: false,
        nullable: true,
        title: 'Especificação em Blocos',
        description: 'Conteúdo JSON da construção da tela em blocos',
    })
    @Column({ nullable: true, type: 'jsonb' })
    code?: BlockSpecification;
}
