import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateKeyboardThemeDto } from '../dto/create-keyboard-theme.dto';
import { KeyboardTheme } from '../model/keyboard-theme.entity';
import { KeyboardThemesService } from '../services/keyboard.service';
import { Public } from '@ci/auth/decorators/public.decorator';

@ApiTags('Keyboard Themes')
@Controller('keyboard-themes')
export class KeyboardThemesController {
    constructor(private readonly keyboardThemesService: KeyboardThemesService) { }

    @Post('create')
    @ApiOperation({ summary: 'Cadastra um novo tema dinâmico para o teclado' })
    @ApiResponse({ status: 201, description: 'Tema criado com sucesso.', type: KeyboardTheme })
    @ApiResponse({ status: 409, description: 'Nome do tema já existe.' })
    create(@Body() createKeyboardThemeDto: CreateKeyboardThemeDto) {
        return this.keyboardThemesService.create(createKeyboardThemeDto);
    }

    @Public()
    @Post('findAll')
    @ApiOperation({ summary: 'Lista todos os temas de teclado cadastrados' })
    @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.', type: [KeyboardTheme] })
    findAll() {
        return this.keyboardThemesService.findAll();
    }

    @Post(':id')
    @ApiOperation({ summary: 'Busca um tema específico pelo ID' })
    @ApiResponse({ status: 200, description: 'Tema encontrado.', type: KeyboardTheme })
    @ApiResponse({ status: 404, description: 'Tema não encontrado.' })
    findOne(@Param('id') id: string) {
        return this.keyboardThemesService.findOne(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Remove um tema pelo ID' })
    @ApiResponse({ status: 200, description: 'Tema removido com sucesso.' })
    remove(@Param('id') id: string) {
        return this.keyboardThemesService.remove(id);
    }
}