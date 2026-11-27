import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import { schema } from "./schema";
import { SeoDomain } from "./seo-domain.entity";
import { SeoCampanha } from "./seo-campanha.entity";
import { SeoKeyWord } from "./seo-key-word.entity";

export class SeoIssue {
    @ApiProperty({ title: 'Código', description: 'Identificador técnico da issue encontrada' })
    codigo: string;

    @ApiProperty({ title: 'Severidade', enum: ['CRITICO', 'ALERTA', 'INFO'] })
    severidade: 'CRITICO' | 'ALERTA' | 'INFO';

    @ApiProperty({ title: 'Mensagem', description: 'Descrição da ocorrência de auditoria' })
    mensagem: string;
}

@Entity({ schema })
export class SeoPage extends FullAuditedEntity {
    @ApiProperty({
        nullable: true,
        required: false,
        title: 'URL',
        description: 'URL completa da página monitorada',
    })
    @Column({ nullable: true })
    url?: string;

    // ---- Resultado da última auditoria on-page ----
    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Título (<title>)',
        description: 'Título extraído da tag <title> na última auditoria',
    })
    @Column({ nullable: true })
    titulo?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Meta Description',
        description: 'Descrição meta da página',
        format: 'textarea',
    })
    @Column({ nullable: true, type: 'text' })
    metaDescription?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'URL Canônica',
        description: 'Valor da tag link rel="canonical"',
    })
    @Column({ nullable: true })
    canonical?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Status HTTP',
        description: 'Código de resposta HTTP da última auditoria',
        type: 'number',
    })
    @Column({ nullable: true })
    statusHttp?: number;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Indexável',
        description: 'Indica se a página permite indexação por mecanismos de busca',
    })
    @Column({ nullable: true })
    indexavel?: boolean;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Tempo de Resposta (ms)',
        description: 'Latência medida na última auditoria em milissegundos',
        type: 'number',
    })
    @Column({ nullable: true })
    tempoRespostaMs?: number;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Score SEO',
        description: 'Pontuação on-page de 0 a 100',
        type: 'number',
    })
    @Column({ nullable: true })
    score?: number;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Última Auditoria',
        description: 'Data e hora da última auditoria executada',
        type: 'string',
        format: 'date-time',
    })
    @Column({ nullable: true, type: 'timestamp' })
    ultimaAuditoria?: Date;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Problemas Encontrados',
        description: 'Lista de apontamentos identificados na auditoria on-page',
        type: SeoIssue,
        isArray: true,
    })
    @Column({ nullable: true, type: 'jsonb' })
    issues?: SeoIssue[];

    // ---- Relacionamentos ----
    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Domínio',
        description: 'Domínio ao qual a página pertence',
        type: () => SeoDomain,
    })
    @ManyToOne(() => SeoDomain, { nullable: true, onDelete: 'SET NULL' })
    dominio?: SeoDomain;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Campanha',
        description: 'Campanha de SEO vinculada à página',
        type: () => SeoCampanha,
    })
    @ManyToOne(() => SeoCampanha, { nullable: true, onDelete: 'SET NULL' })
    campanha?: SeoCampanha;

    @ApiProperty({
        nullable: true,
        required: false,
        title: 'Palavras-chave',
        description: 'Palavras-chave alvo associadas a esta página',
        type: () => SeoKeyWord,
        isArray: true,
    })
    @ManyToMany(() => SeoKeyWord)
    @JoinTable({ schema })
    palavrasChave?: SeoKeyWord[];
}
