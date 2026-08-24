// create-indicator-config.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CreateIndicatorConfigDto {
    @ApiProperty({ example: 'INCC' })
    name: string;

    @ApiProperty({ example: 192 })
    code: number;

    @ApiProperty({ example: 'Índice Nacional de Custo da Construção', required: false })
    description?: string;
}