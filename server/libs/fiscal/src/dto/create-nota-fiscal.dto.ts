import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, Length } from 'class-validator';

export class CreateNotaFiscalDto {
    @ApiProperty({ example: '12345678000199', description: 'CNPJ do prestador (sua empresa)' })
    @IsString()
    @Length(14, 14)
    cnpjPrestador?: string;

    @ApiProperty({ example: '98765432000199', description: 'CNPJ do tomador (cliente)' })
    @IsString()
    @Length(14, 14)
    cnpjTomador?: string;

    @ApiProperty({ example: 1500.50, description: 'Valor total do serviço ou produto' })
    @IsNumber()
    @IsNotEmpty()
    valorTotal?: number;

    @ApiProperty({ example: 'Desenvolvimento de software sob medida', description: 'Descrição detalhada' })
    @IsString()
    @IsNotEmpty()
    descricaoServico?: string;
}