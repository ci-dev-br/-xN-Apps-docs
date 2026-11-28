import { MatriculaService } from './service/matricula.service';
import { AulaService } from './service/aula.service';
import { AnotacaoEstudoService } from './service/anotacao-estudo.service';

describe('Treinamento Services', () => {
    it('AulaService.anexarVideo deve vincular metadados do StorageAsset processado pelo FFmpeg', async () => {
        const aulaEntity: any = { internalId: 'aula-1', cursoId: 'curso-1', titulo: 'Aula 1' };
        const aulaRepo: any = {
            findOne: jest.fn().mockResolvedValue(aulaEntity),
            save: jest.fn().mockImplementation(async (x) => x),
        };
        const storageMedia: any = {
            getAssetInfo: jest.fn().mockResolvedValue({
                internalId: 'asset-video-1',
                fileName: 'aula1.mp4',
                durationSeconds: 185,
                durationLabel: '03:05',
                posterDataUrl: 'data:image/jpeg;base64,AAA',
                width: 1280,
                height: 720,
                videoCodec: 'h264',
                audioCodec: 'aac',
                sizeBytes: 1024000,
                transcoded: true,
                mimeType: 'video/mp4',
            }),
        };
        const cursoService: any = {
            recalcularCargaHoraria: jest.fn().mockResolvedValue(undefined),
        };
        const snap: any = { snapshot: jest.fn() };

        const service = new AulaService(snap, aulaRepo, storageMedia, cursoService);
        const updated = await service.anexarVideo({ aulaId: 'aula-1', assetId: 'asset-video-1' });

        expect(updated.videoAssetId).toBe('asset-video-1');
        expect(updated.duracaoLabel).toBe('03:05');
        expect(updated.thumbnailDataUrl).toBe('data:image/jpeg;base64,AAA');
        expect(cursoService.recalcularCargaHoraria).toHaveBeenCalledWith('curso-1');
    });

    it('AulaService.anexarMaterial e removerMaterial devem gerenciar materiais de apoio', async () => {
        const aulaEntity: any = { internalId: 'aula-1', materiaisApoio: [] };
        const aulaRepo: any = {
            findOne: jest.fn().mockResolvedValue(aulaEntity),
            save: jest.fn().mockImplementation(async (x) => x),
        };
        const storageMedia: any = {
            getAssetInfo: jest.fn().mockResolvedValue({
                internalId: 'mat-1',
                originalFileName: 'apostila.pdf',
                mimeType: 'application/pdf',
                sizeBytes: 54321,
            }),
        };
        const service = new AulaService({} as any, aulaRepo, storageMedia, {} as any);
        const withMat = await service.anexarMaterial({ aulaId: 'aula-1', assetId: 'mat-1', descricao: 'Apostila oficial' });
        expect(withMat.materiaisApoio?.length).toBe(1);
        expect(withMat.materiaisApoio?.[0].nome).toBe('apostila.pdf');

        const afterRemove = await service.removerMaterial({ aulaId: 'aula-1', assetId: 'mat-1' });
        expect(afterRemove.materiaisApoio?.length).toBe(0);
    });

    it('MatriculaService.registrarProgresso deve calcular progresso e emitir certificado ao atingir 100%', async () => {
        const matriculaEntity: any = {
            internalId: 'mat-1',
            cursoId: 'c-1',
            userId: 'u-1',
            aulasConcluidasIds: [],
            ultimoTempoPorAula: {},
            progresso: 0,
        };
        const matriculaRepo: any = {
            findOne: jest.fn().mockResolvedValue(matriculaEntity),
            save: jest.fn().mockImplementation(async (x) => x),
        };
        const cursoRepo: any = {
            findOne: jest.fn().mockResolvedValue({ internalId: 'c-1', titulo: 'Curso Teste' }),
        };
        const aulaRepo: any = {
            find: jest.fn().mockResolvedValue([
                { internalId: 'a-1' },
                { internalId: 'a-2' },
            ]),
        };
        const service = new MatriculaService({} as any, matriculaRepo, cursoRepo, aulaRepo);
        const req = { user: { id: 'u-1', fullName: 'Aluno Teste' } };

        const p1 = await service.registrarProgresso({ cursoId: 'c-1', aulaId: 'a-1', concluida: true, ultimoTempoSegundos: 42 }, req);
        expect(p1.progresso).toBe(50);
        expect(p1.ultimoTempoPorAula?.['a-1']).toBe(42);
        expect(p1.certificadoCodigo).toBeUndefined();

        const p2 = await service.registrarProgresso({ cursoId: 'c-1', aulaId: 'a-2', concluida: true, ultimoTempoSegundos: 120 }, req);
        expect(p2.progresso).toBe(100);
        expect(p2.certificadoCodigo).toMatch(/^CI-TRN-/);
    });

    it('AnotacaoEstudoService.sincronizar deve formatar timestampLabel automaticamente', async () => {
        const repo: any = {
            create: jest.fn().mockImplementation((d) => ({ ...d })),
            save: jest.fn().mockImplementation(async (x) => ({ ...x, internalId: 'note-1' })),
        };
        const service = new AnotacaoEstudoService({ snapshot: jest.fn() } as any, repo);
        const saved = await service.sincronizar({
            titulo: 'Ponto importante',
            conteudo: 'Explicação sobre FFmpeg faststart',
            cursoId: 'c-1',
            aulaId: 'a-1',
            timestampSegundos: 125,
        }, { user: { id: 'u-1' } });

        expect(saved.timestampLabel).toBe('02:05');
        expect(saved.userId).toBe('u-1');
    });
});
