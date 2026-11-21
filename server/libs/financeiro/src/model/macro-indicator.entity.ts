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
    @Column('decimal', { precision: 14, scale: 4 })
    value: number;

    @ApiProperty({ example: 0.22, description: 'Variação percentual ou em pontos em relação à leitura anterior', required: false })
    @Column('decimal', { precision: 10, scale: 4, nullable: true })
    variation?: number;

    @ApiProperty({ example: 'Banco Central (SGS 432)', description: 'Fonte da extração do indicador', required: false })
    @Column({ length: 120, nullable: true })
    source?: string;

    @ApiProperty({ example: '2026-11-21T07:00:00.000Z', description: 'Data e hora em que o indicador foi extraído', required: false })
    @Column({ name: 'extracted_at', type: 'timestamp', nullable: true })
    extractedAt?: Date;
}