import { ApiProperty } from "@nestjs/swagger";
import { CurrencyCode } from "@ci/i11n/models/currency-code.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
/**
 * Offer refere-se à oferta feita sobre um produto para venda. 
 *
 */
@Entity()
export class Offer {
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @ApiProperty({
        nullable: true,
        required: false,
    })
    @ApiProperty({ type: CurrencyCode })
    @ManyToMany(() => CurrencyCode)
    currency?: CurrencyCode;
    @ApiProperty({
        description: 'Ammount of Offer',
        example: 0.123,
    })
    @Column({
        nullable: false
    })
    ammount?: number;
    @ApiProperty({
        description: 'Data de cadastramento.'
    })
    @CreateDateColumn({
        comment: 'Data de cadastramento.',
    })
    createdAt: Date;
}