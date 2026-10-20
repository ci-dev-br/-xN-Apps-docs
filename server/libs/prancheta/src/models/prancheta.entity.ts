import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/core";

export class CardOption {
    [option: string]: any;
}

export class Card {
    @ApiProperty({ nullable: true, required: false })
    componentName?: string;
    @ApiProperty({ nullable: true, required: false })
    componentVersion?: string;
    @ApiProperty({ nullable: true, required: false })
    settings?: CardOption;
    @ApiProperty({ nullable: true, required: false })
    cols?: number;
    @ApiProperty({ nullable: true, required: false })
    rows?: number;
    @ApiProperty({ nullable: true, required: false })
    title?: string;
}

@Entity()
export class Prancheta extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    title?: string;

    @ApiProperty({ nullable: true, required: false, title: 'Layout da Prancheta', type: 'any' })
    @Column({ nullable: true, type: 'jsonb' })
    layout?: any;

    @ApiProperty({ type: Card, nullable: true, required: false, isArray: true })
    @Column({ type: 'jsonb', nullable: true })
    cards?: Card[];

    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    order?: number;

    @ApiProperty({ nullable: true, required: false, description: 'Código interno para prancheta Padrão, permite compartilhar a prancheta internamente entre usuários a partir de seu código global' })
    @Column({ nullable: true, unique: true })
    codigoGlobal?: string;

    @ApiProperty({ nullable: true, required: false, enum: ['USER', 'TENANT'], description: 'Escopo de compartilhamento: USER (apenas criador) ou TENANT (todos os membros do tenant)' })
    @Column({ nullable: true, default: 'USER' })
    scope?: 'USER' | 'TENANT';
}
