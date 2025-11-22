import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { FullAuditedEntity } from "@ci/core";
import { Marca } from "@ci/inpi/model/marca.entity";
import { schema } from "./schema";
import { UnidadeMedida } from "@ci/cadastro/model/unidade-medida.entity";
@Entity({
    schema
})
export class Product extends FullAuditedEntity {
    @ApiProperty({
        title: 'Código GTIN',
        nullable: true,
        required: false
    })
    @Column({ nullable: true })
    gtin?: string;
    @ApiProperty({
        title: 'Código de Barras',
        nullable: true, required: false
    })
    @Column({ nullable: true })
    codigoBarras?: string;
    @ApiProperty({
        title: 'Nosso Código',
        nullable: true, required: false
    })
    @Column({
        nullable: true
    })
    nossoCodigo?: string;
    @ApiProperty({
        title: 'Código do Fabricante',
        nullable: true, required: false
    })
    @Column({ nullable: true })
    codigoFabricanete?: string;
    @ApiProperty({
        title: 'Código SKU',
        nullable: true, required: false
    })
    @Column({ nullable: true })
    sku?: string;
    @ApiProperty({ title: 'Descrição', nullable: true, required: false })
    @Column({ nullable: true })
    description?: string;
    @ApiProperty({ title: 'Nome', nullable: true, required: false })
    @Column({ nullable: true })
    name?: string;
    @ApiProperty({
        title: 'Descrição Curta',
        nullable: true, required: false
    })
    @Column({ nullable: true })
    shortDescription?: string;
    @ApiProperty({ title: 'Site', nullable: true, required: false, description: 'URL do site' })
    @Column({ nullable: true })
    urlWebsiteOficial?: string;
    @ApiProperty({ title: 'Marca', type: Marca, nullable: true, required: false, })
    @ManyToOne(type => Marca)
    @JoinTable()
    marca?: Marca;
    @ApiProperty({ title: 'Sub Grupo', nullable: true, required: false, })
    subGrupo?: string;
    @ApiProperty({ nullable: true, required: false, })
    @Column({ length: 3, nullable: true, default: 'BRL' })
    moeda?: string;
    @ApiProperty({ title: 'Unidade de Medida', nullable: true, required: false, type: UnidadeMedida })
    @ManyToOne(type => UnidadeMedida)
    @JoinTable()
    unidadeMedida?: UnidadeMedida;
    // categoria:Catego
    /* @ApiProperty({ nullable: true, required: false })
    @ManyToOne(() => Tenant)
    @JoinTable()
    tenant: Tenant; */
}