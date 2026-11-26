// indicator-config.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { FullAuditedEntity } from '@ci/manager/dao/entities';

@Entity('indicator_configs')
export class IndicatorConfig extends FullAuditedEntity {

    @ApiProperty({ example: 'SELIC', description: 'Nome amigável do indicador' })
    @Column({ length: 50, unique: true })
    name: string;

    @ApiProperty({ example: 11, description: 'Código da série temporal no SGS (Banco Central)' })
    @Column({ unique: true })
    code: number;

    @ApiProperty({ example: 'Taxa Selic apurada diariamente (% a.d.)', required: false })
    @Column({ length: 255, nullable: true })
    description: string;

    @ApiProperty({ example: true, description: 'Se falso, o scraper irá ignorar este índice' })
    @Column({ default: true, name: 'is_active' })
    isActive: boolean;
}