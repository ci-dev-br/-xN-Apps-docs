import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PranchetaItemMetadata } from "./prancheta-item-metadata.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class Prancheta {
    @ApiProperty({})
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @ApiProperty({})
    @Column()
    title?: string;
    @ApiProperty({})
    @Column()
    layout?: string;
    /* @OneToMany(() => PranchetaItemMetadata, item => item.prnahceta)
    items?: PranchetaItemMetadata[]; */
}