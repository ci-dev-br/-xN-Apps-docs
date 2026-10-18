import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Company } from './company.entity';
import { DailyQuote } from './daily-quote.entity';
import { schema } from '../norms';
@Entity({ schema })
export class Asset {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ example: 'PETR4', description: 'Ticker de negociação na B3' })
    @Column({ length: 10, unique: true })
    ticker: string;

    @ApiProperty({ example: 'Acao Preferencial', description: 'Tipo do Ativo (ON, PN, FII)' })
    @Column({ length: 50 })
    type: string;

    @ApiProperty({ type: () => Company })
    @ManyToOne(() => Company, (company) => company.assets)
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @OneToMany(() => DailyQuote, (quote) => quote.asset)
    quotes: DailyQuote[];
}