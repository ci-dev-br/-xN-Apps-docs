import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KeyboardTheme } from '../model/keyboard-theme.entity';
import { CreateKeyboardThemeDto } from '../dto/create-keyboard-theme.dto';

@Injectable()
export class KeyboardThemesService {
    constructor(
        @InjectRepository(KeyboardTheme)
        private readonly themeRepository: Repository<KeyboardTheme>,
    ) { }

    async create(createDto: CreateKeyboardThemeDto): Promise<KeyboardTheme> {
        const existing = await this.themeRepository.findOne({ where: { name: createDto.name } });
        if (existing) {
            throw new ConflictException(`Tema com o identificador ${createDto.name} já existe.`);
        }

        const theme = this.themeRepository.create(createDto);
        return this.themeRepository.save(theme);
    }

    async findAll(): Promise<KeyboardTheme[]> {
        return this.themeRepository.find();
    }

    async findOne(id: string): Promise<KeyboardTheme> {
        const theme = await this.themeRepository.findOne({ where: { id } });
        if (!theme) {
            throw new NotFoundException(`Tema ID ${id} não encontrado`);
        }
        return theme;
    }

    async remove(id: string): Promise<void> {
        const theme = await this.findOne(id);
        await this.themeRepository.remove(theme);
    }
}