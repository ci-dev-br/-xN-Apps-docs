import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IconsServices } from './icons.service';
import { Icon } from '../models/icon.entity';
import { IconPack } from '../models/icon-pack.entity';

describe('IconsServices', () => {
    let service: IconsServices;

    const mockIconRepo = {
        find: jest.fn().mockResolvedValue([]),
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn((v) => v),
        save: jest.fn(async (v) => ({ internalId: 'icon-1', ...v })),
        createQueryBuilder: jest.fn(() => ({
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
        })),
    };

    const mockPackRepo = {
        find: jest.fn().mockResolvedValue([]),
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn((v) => v),
        save: jest.fn(async (v) => ({ internalId: 'pack-1', ...v })),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                IconsServices,
                { provide: getRepositoryToken(Icon), useValue: mockIconRepo },
                { provide: getRepositoryToken(IconPack), useValue: mockPackRepo },
            ],
        }).compile();

        service = module.get<IconsServices>(IconsServices);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should sanitize dangerous scripts and event handlers from SVG', () => {
        const unsafe = '<svg viewBox="0 0 24 24" onload="alert(1)"><script>alert(2)</script><circle cx="12" cy="12" r="8" onclick="bad()" fill="#2f4bff" /></svg>';
        const clean = service.sanitizeSvg(unsafe);
        expect(clean).not.toContain('<script');
        expect(clean).not.toContain('onload=');
        expect(clean).not.toContain('onclick=');
        expect(clean).toContain('xmlns="http://www.w3.org/2000/svg"');
        expect(clean).toContain('<circle');
    });

    it('should reject invalid SVG without <svg> root', () => {
        expect(() => service.sanitizeSvg('<div>not an svg</div>')).toThrow();
    });

    it('should reject path traversal identifiers when saving icon', async () => {
        await expect(
            service.saveWorkspaceIcon({
                packCode: '../etc',
                code: 'bad',
                svgContent: '<svg viewBox="0 0 24 24"><rect width="10" height="10" /></svg>',
                writeToAssets: false,
            })
        ).rejects.toThrow();
    });

    it('should save pack and icon to DB without touching assets when writeToAssets=false', async () => {
        const pack = await service.saveWorkspacePack({
            code: 'test-pack',
            name: 'Pacote Teste',
            version: '1.2.0',
            targetApps: ['Codex'],
            writeToAssets: false,
        });
        expect(pack.code).toBe('test-pack');
        expect(mockPackRepo.save).toHaveBeenCalled();

        const icon = await service.saveWorkspaceIcon({
            packCode: 'test-pack',
            code: 'acao-salvar',
            svgContent: '<svg viewBox="0 0 24 24"><path d="M5 12h14" stroke="currentColor" /></svg>',
            usageType: 'action',
            linkedApps: ['Codex'],
            linkedActions: ['navbar:save'],
            writeToAssets: false,
        });
        expect(icon.code).toBe('acao-salvar');
        expect(icon.linkedActions).toEqual(['navbar:save']);
        expect(mockIconRepo.save).toHaveBeenCalled();
    });

    it('should list workspace packs and build runtime manifest', async () => {
        const res = await service.getWorkspacePacks();
        expect(Array.isArray(res.packs)).toBe(true);
        const manifest = await service.getRuntimeManifest();
        expect(manifest).toHaveProperty('icons');
    });
});
