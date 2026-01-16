import {
    ApiProperty
} from "@nestjs/swagger";
import {
    Entity, PrimaryGeneratedColumn, Column, OneToMany
} from "typeorm";
import {
    schema
} from "./schema";
import {
    VendaProduto
} from "./venda-produto";
import {
    FullAuditedEntity
} from "@ci/manager";
@Entity({
    schema
})
export class Produto extends FullAuditedEntity {
    @ApiProperty({
        title: 'Nome',
        maxLength: 255
    })
    @Column({
        length: 255, nullable: true
    })
    nome?: string;
    @ApiProperty({
        title: 'Descrição', type: 'string', nullable: true
    })
    @Column({
        type: 'text', nullable: true
    })
    descricao?: string;
    @ApiProperty({
        title: 'Preço de Custo', type: 'number', format: 'float'
    })
    @Column({
        type: 'decimal', precision: 10, scale: 2, nullable: true
    })
    precoCusto: number;
    @ApiProperty({
        title: 'Preço de Venda', type: 'number', format: 'float'
    })
    @Column({
        type: 'decimal', precision: 10, scale: 2, nullable: true
    })
    precoVenda: number;
    @ApiProperty({
        title: 'Posição Estoque',
    })
    @Column({
        type: 'int', nullable: true
    })
    estoque: number;
    @ApiProperty({
        maxLength: 100, nullable: true
    })
    @Column({
        length: 100, nullable: true
    })
    marca?: string;
    @ApiProperty({
        maxLength: 100, nullable: true
    })
    @Column({
        length: 100, nullable: true
    })
    categoria?: string;
    @OneToMany(() => VendaProduto, (vendaProduto) => vendaProduto.produto)
    vendasProdutos: VendaProduto[];
}