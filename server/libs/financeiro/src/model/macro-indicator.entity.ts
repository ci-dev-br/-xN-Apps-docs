import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { schema } from '../norms';

@Entity({ schema })
export class MacroIndicator {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ example: 'SELIC', description: 'Nome do Indicador (ex: SELIC, IPCA, DOLAR)' })
    @Column({ length: 50 })
    name: string;

    @ApiProperty({ example: '2026-08-22', description: 'Data de referência' })
    @Column({ type: 'date' })
    date: Date;

    @ApiProperty({ example: 10.50, description: 'Valor do indicador na data' })
    @Column('decimal', { precision: 10, scale: 4 })
    value: number;
}