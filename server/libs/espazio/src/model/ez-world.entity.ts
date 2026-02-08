import { FullAuditedEntity } from '@ci/manager';
import { Column, Entity } from 'typeorm';
import { schema } from './schema';
import { ApiProperty } from '@nestjs/swagger';
/**
 * EzWorld entity represents a world or spatial environment within the Espazio system.
 */
@Entity({ schema })
export class EzWorld extends FullAuditedEntity {
    /// @ApiProperty({ required: false, nullable: true }) @Column({ nullable: true }) positionX?: number;
    /// @ApiProperty({ required: false, nullable: true }) @Column({ nullable: true }) positionY?: number;
    /// @ApiProperty({ required: false, nullable: true }) @Column({ nullable: true }) positionZ?: number;
}