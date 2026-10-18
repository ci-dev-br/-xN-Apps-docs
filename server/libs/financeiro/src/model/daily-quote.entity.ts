import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Asset } from './asset.entity';

import { schema } from '../norms';
@Entity({ schema }) export class DailyQuote {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ example: '2026-08-22', description: 'Data do pregão' })
    @Column({ type: 'date' })
    date: Date;

    @ApiProperty({ example: 35.50 })
    @Column('decimal', { precision: 10, scale: 2 })
    open: number;

    @ApiProperty({ example: 36.10 })
    @Column('decimal', { precision: 10, scale: 2 })
    high: number;

    @ApiProperty({ example: 34.90 })
    @Column('decimal', { precision: 10, scale: 2 })
    low: number;

    @ApiProperty({ example: 35.80 })
    @Column('decimal', { precision: 10, scale: 2 })
    close: number;

    @ApiProperty({ example: 15000000, description: 'Volume financeiro negociado' })
    @Column('bigint')
    volume: number;

    @ManyToOne(() => Asset, (asset) => asset.quotes)
    @JoinColumn({ name: 'asset_id' })
    asset: Asset;
}