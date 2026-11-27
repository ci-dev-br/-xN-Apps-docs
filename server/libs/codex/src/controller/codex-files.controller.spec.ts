import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { ROLE_KEY } from '@ci/auth/decorators/role.decorator';
import { IS_PUBLIC_KEY } from '@ci/auth/decorators/public.decorator';
import { CodexFilesController } from './codex-files.controller';
import { CodexService } from '../service/codex.service';

describe('CodexFilesController & CodexService.locateFilesByName', () => {
    let service: CodexService;
    let controller: CodexFilesController;

    beforeEach(() => {
        service = new CodexService();
        controller = new CodexFilesController(service);
    });

    it('deve exigir role DEVELOPER ou SYSADMIN no CodexFilesController', () => {
        const roleMeta = Reflect.getMetadata(ROLE_KEY, CodexFilesController);
        const publicMeta = Reflect.getMetadata(IS_PUBLIC_KEY, CodexFilesController);

        expect(roleMeta).toEqual(['DEVELOPER', 'SYSADMIN']);
        expect(publicMeta).toBeUndefined();
    });

    it('deve localizar dyn-form.component.ts pelo nome exato no workspace', async () => {
        const result = await controller.locateByQuery('dyn-form.component.ts');

        expect(result.found).toBe(true);
        expect(result.primaryFile).not.toBeNull();
        expect(result.primaryFile?.name).toBe('dyn-form.component.ts');
        expect(result.primaryFile?.path).toContain('dyn-form/src/dyn-form.component.ts');
        expect(result.primaryFile?.score).toBe(100);
    });

    it('deve localizar múltiplos arquivos relacionados pelo prefixo do nome e filtrar por extensão via POST', async () => {
        const result = await controller.locateByBody({
            name: 'dyn-form.component',
            extensions: ['.ts', '.html'],
            limit: 10,
        });

        expect(result.found).toBe(true);
        const names = result.files.map(f => f.name);
        expect(names).toContain('dyn-form.component.ts');
        expect(names).toContain('dyn-form.component.html');
        expect(result.files.every(f => f.extension === '.ts' || f.extension === '.html')).toBe(true);
    });

    it('deve rejeitar busca vazia ou tentativa de traversal com BadRequestException', async () => {
        await expect(controller.locateByBody({ name: '   ' })).rejects.toThrow(BadRequestException);
        await expect(controller.locateByBody({ name: '../etc/passwd' })).rejects.toThrow(BadRequestException);
        await expect(
            controller.locateByBody({ name: 'dyn-form.component.ts', directory: '../../outside' }),
        ).rejects.toThrow(BadRequestException);
    });
});
