import { FullAuditedEntity } from "@ci/manager/dao/entities";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToOne } from "typeorm";
import { schema } from "./schema";
import { SeoDomain } from "./seo-domain.entity";

@Entity({ schema })
export class SeoKeyWord extends FullAuditedEntity {
    @ApiProperty({
        required: false,
        nullable: true,
        title: 'Termo / Palavra-chave',
        description: 'Expressão ou palavra-chave monitorada',
    })
    @Column({ nullable: true })
    termo?: string;

    @ApiProperty({
        required: false,
        nullable: true,
        title: 'Volume de Pesquisa',
        description: 'Volume mensal estimado de buscas',
        type: 'number',
    })
    @Column({ nullable: true })
    voulePesquisa?: number;

    @ApiProperty({
        required: false,
        nullable: true,
        title: 'Dificuldade (KD)',
        description: 'Índice de dificuldade de ranqueamento (0 a 100)',
        type: 'number',
    })
    @Column({ nullable: true })
    dificuldadeClassificacao?: number;

    @ApiProperty({
        required: false,
        nullable: true,
        title: 'Intenção de Pesquisa',
        description: 'Pontuação ou código de intenção de busca',
        type: 'number',
    })
    @Column({ nullable: true })
    intencaoPesquisa?: number;

    @ApiProperty({
        required: false,
        nullable: true,
        title: 'Posição Atual (SERP)',
        description: 'Posição atual nos resultados de busca',
        type: 'number',
    })
    @Column({ nullable: true })
    posicaoAtual?: number;

    @ApiProperty({
        required: false,
        nullable: true,
        title: 'Posição Anterior (SERP)',
        description: 'Posição anterior registrada no SERP',
        type: 'number',
    })
    @Column({ nullable: true })
    posicaoAnterior?: number;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Domínio',
        description: 'Domínio associado a esta palavra-chave',
        type: () => SeoDomain,
    })
    @ManyToOne(() => SeoDomain, { nullable: true, onDelete: 'SET NULL' })
    dominio?: SeoDomain;
}
