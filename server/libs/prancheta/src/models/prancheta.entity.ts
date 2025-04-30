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
    @ApiProperty({ nullable: true, required: false, type: CardOption })
    settings: CardOption;
}
@Entity()
export class Prancheta extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    title?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    layout?: string;
    @ApiProperty({ type: Card, nullable: true, required: false, isArray: true })
    @Column({ type: 'jsonb', nullable: true })
    cards?: Card[];
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    order?: number;
    /* @OneToMany(() => PranchetaItemMetadata, item => item.prnahceta)
    items?: PranchetaItemMetadata[]; */
    @ApiProperty({ nullable: true, required: false, description: 'Código interno para prancheta Padrão, permite compartilhar a prancheta internamente entre usuários a partir de seu código global' })
    @Column({ nullable: true, unique: true, })
    codigoGlobal?: string;
}