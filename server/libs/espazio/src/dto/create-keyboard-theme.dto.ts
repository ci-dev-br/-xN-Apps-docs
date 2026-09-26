import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateKeyboardThemeDto {
    @ApiProperty({ example: 'theme-hacker' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Hacker Terminal' })
    @IsString()
    @IsNotEmpty()
    displayName: string;

    @ApiProperty({ example: '#000000' })
    @IsString()
    @IsNotEmpty()
    bg: string;

    @ApiProperty({ example: '#222222' })
    @IsString()
    @IsNotEmpty()
    keyBg: string;

    @ApiProperty({ example: '#00ff00' })
    @IsString()
    @IsNotEmpty()
    keyColor: string;

    @ApiProperty({ example: '0px' })
    @IsString()
    @IsNotEmpty()
    keyRadius: string;

    @ApiProperty({ example: '#005500' })
    @IsString()
    @IsNotEmpty()
    keyActionBg: string;

    @ApiProperty({ example: '#00ff00' })
    @IsString()
    @IsNotEmpty()
    keyActionColor: string;

    @ApiProperty({ example: '#111111' })
    @IsString()
    @IsNotEmpty()
    keyModBg: string;

    @ApiProperty({ example: '#00ff00' })
    @IsString()
    @IsNotEmpty()
    keyModColor: string;

    @ApiPropertyOptional({ example: 'none' })
    @IsString()
    @IsOptional()
    keyShadow?: string;

    @ApiPropertyOptional({ example: '"Courier New", Courier, monospace' })
    @IsString()
    @IsOptional()
    fontFamily?: string;

    @ApiPropertyOptional({ example: '4px' })
    @IsString()
    @IsOptional()
    keyGap?: string;
}