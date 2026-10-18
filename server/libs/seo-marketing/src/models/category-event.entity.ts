import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from './category.entity';
import { schema } from './schema';

export enum CategoryEventType {
    TREND_STARTED = 'TREND_STARTED',
    TREND_RESTARTED = 'TREND_RESTARTED',
    VOLUME_CHANGED = 'VOLUME_CHANGED',
    TREND_ENDED = 'TREND_ENDED',
}

@Entity({ schema })
export class CategoryEvent {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ enum: CategoryEventType })
    @Column({ type: 'varchar' })
    type: CategoryEventType;

    @ApiProperty({ description: 'Volume da tendência no momento do evento' })
    @Column({ type: 'int', default: 0 })
    volume: number;

    @ManyToOne(() => Category, (category) => category.events, { onDelete: 'CASCADE' })
    category: Category;

    @CreateDateColumn()
    createdAt: Date;
}