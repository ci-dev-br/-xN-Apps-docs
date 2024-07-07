import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { FullAuditedEntity } from "@ci/core";
import { Marca } from "@ci/inpi/model/marca.entity";

@Entity()
export class Product extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    gtin?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    codigoBarras?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    nossoCodigo?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    codigoFabricanete?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    sku?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    description?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    shortDescription?: string;
    @ApiProperty({ nullable: true, required: false, description: 'URL do site' })
    @Column({ nullable: true })
    urlWebsiteOficial?: string;
    @ApiProperty({ type: Marca, nullable: true, required: false, })
    @ManyToOne(type => Marca)
    @JoinTable()
    marca?: Marca;
    @ApiProperty({ nullable: true, required: false, })
    subGrupo: string;
    /* @ApiProperty({ nullable: true, required: false })
    @ManyToOne(() => Tenant)
    @JoinTable()
    tenant: Tenant; */
}