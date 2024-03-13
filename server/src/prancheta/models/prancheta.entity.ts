import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "src/core/dao";

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
    @ApiProperty({ type: Card, nullable: true, required: false })
    @Column({ type: 'jsonb', nullable: true })
    cards?: Card[];
    /* @OneToMany(() => PranchetaItemMetadata, item => item.prnahceta)
    items?: PranchetaItemMetadata[]; */
}