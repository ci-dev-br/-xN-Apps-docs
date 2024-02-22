import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "src/core/dao";

export class Card {
    @ApiProperty({ nullable: true, required: false })
    template?: string;
}

@Entity()
export class Prancheta extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false })
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    title?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    layout?: string;
    @ApiProperty({ type: Card, nullable: true, required: false })
    @Column({ type: 'jsonb' })
    cards?: Card;
    /* @OneToMany(() => PranchetaItemMetadata, item => item.prnahceta)
    items?: PranchetaItemMetadata[]; */
}