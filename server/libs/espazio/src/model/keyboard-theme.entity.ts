import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { schema } from './schema';

@Entity({ schema })
export class KeyboardTheme {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID único do tema' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ example: 'theme-neon', description: 'Identificador do tema (classe base)' })
    @Column({ unique: true })
    name: string;

    @ApiProperty({ example: 'Neon Cyberpunk', description: 'Nome de exibição no menu' })
    @Column()
    displayName: string;

    @ApiProperty({ example: '#0f0f0f', description: 'Variável --bg' })
    @Column({ name: 'bg' })
    bg: string;

    @ApiProperty({ example: '#1a1a1a', description: 'Variável --key-bg' })
    @Column({ name: 'key_bg' })
    keyBg: string;

    @ApiProperty({ example: '#00ffcc', description: 'Variável --key-color' })
    @Column({ name: 'key_color' })
    keyColor: string;

    @ApiProperty({ example: '4px', description: 'Variável --key-radius' })
    @Column({ name: 'key_radius' })
    keyRadius: string;

    @ApiProperty({ example: '#ff00ff', description: 'Variável --key-action-bg' })
    @Column({ name: 'key_action_bg' })
    keyActionBg: string;

    @ApiProperty({ example: '#ffffff', description: 'Variável --key-action-color' })
    @Column({ name: 'key_action_color' })
    keyActionColor: string;

    @ApiProperty({ example: '#333333', description: 'Variável --key-mod-bg' })
    @Column({ name: 'key_mod_bg' })
    keyModBg: string;

    @ApiProperty({ example: '#00ffcc', description: 'Variável --key-mod-color' })
    @Column({ name: 'key_mod_color' })
    keyModColor: string;

    @ApiProperty({ example: '0 0 10px #00ffcc', description: 'Variável --key-shadow', nullable: true })
    @Column({ name: 'key_shadow', nullable: true })
    keyShadow: string;

    @ApiProperty({ example: 'monospace', description: 'Variável --font-family' })
    @Column({ name: 'font_family', default: 'monospace' })
    fontFamily: string;

    @ApiProperty({ example: '2px', description: 'Variável --key-gap', nullable: true })
    @Column({ name: 'key_gap', default: '0px' })
    keyGap: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}