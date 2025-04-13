import { ApiProperty } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { schema } from "./schema";
import { VendaProduto } from "./venda-produto";
import { FullAuditedEntity } from "@ci/manager";
@Entity({
    schema
})
export class Produto extends FullAuditedEntity {
    @ApiProperty({ maxLength: 255 })
    @Column({ length: 255 })
    nome: string;
    @ApiProperty({ type: 'string', nullable: true })
    @Column({ type: 'text', nullable: true })
    descricao?: string;
    @ApiProperty({ type: 'number', format: 'float' })
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precoCusto: number;
    @ApiProperty({ type: 'number', format: 'float' })
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precoVenda: number;
    @ApiProperty()
    @Column({ type: 'int' })
    estoque: number;
    @ApiProperty({ maxLength: 100, nullable: true })
    @Column({ length: 100, nullable: true })
    marca?: string;
    @ApiProperty({ maxLength: 100, nullable: true })
    @Column({ length: 100, nullable: true })
    categoria?: string;
    @OneToMany(() => VendaProduto, (vendaProduto) => vendaProduto.produto)
    vendasProdutos: VendaProduto[];
}