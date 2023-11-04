import { ApiProperty } from "@nestjs/swagger";
import { Currency } from "src/globalization/models/currency.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";


/**
 * Offer refere-se à oferta feita sobre um produto para venda. 
 *
 */
@Entity()
export class Offer {
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @ApiProperty({})
    @Column({})
    price?: number;
    @ApiProperty({})
    @ManyToMany(() => Currency)
    currency?: Currency;
    @ApiProperty({
        description: 'Data de cadastramento.'
    })
    @CreateDateColumn({
        comment: 'Data de cadastramento.',
    })
    createdAt: Date;
}