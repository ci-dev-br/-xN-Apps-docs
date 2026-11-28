import { FfmpegMediaService } from './ffmpeg-media.service';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('FfmpegMediaService', () => {
    let service: FfmpegMediaService;
    let workDir: string;

    beforeAll(async () => {
        service = new FfmpegMediaService();
        workDir = await fs.mkdtemp(join(tmpdir(), 'ci-ffmpeg-test-'));
    });

    afterAll(async () => {
        if (workDir && existsSync(workDir)) {
            await fs.rm(workDir, { recursive: true, force: true }).catch(() => { });
        }
    });

    it('deve resolver os binários ffmpeg-static e ffprobe-static', () => {
        const diag = service.getBinaryDiagnostics();
        expect(diag.ffmpeg).toBeTruthy();
        expect(diag.ffprobe).toBeTruthy();
        expect(existsSync(diag.ffmpeg!)).toBe(true);
        expect(existsSync(diag.ffprobe!)).toBe(true);
    });

    it('deve formatar duração corretamente em MM:SS e HH:MM:SS', () => {
        expect(service.formatDuration(0)).toBe('00:00');
        expect(service.formatDuration(65)).toBe('01:05');
        expect(service.formatDuration(3661)).toBe('01:01:01');
    });

    it('deve processar vídeo com FFmpeg extraindo metadados e gerando miniatura JPEG', async () => {
        const sourcePath = join(workDir, 'sample-input.mp4');
        const assetDir = join(workDir, 'asset-out');
        await fs.mkdir(assetDir, { recursive: true });

        // Gera um vídeo sintético de 1 segundo via ffmpeg lavfi
        await new Promise<void>((resolve, reject) => {
            ffmpeg()
                .input('color=c=blue:s=320x240:d=1')
                .inputFormat('lavfi')
                .outputOptions(['-c:v libx264', '-pix_fmt yuv420p', '-t 1', '-y'])
                .output(sourcePath)
                .on('end', () => resolve())
                .on('error', reject)
                .run();
        });

        const result = await service.processUploadedVideo(sourcePath, assetDir, true);
        expect(result.sizeBytes).toBeGreaterThan(0);
        expect(result.metadata.durationSeconds).toBeGreaterThan(0.5);
        expect(result.metadata.width).toBe(320);
        expect(result.metadata.height).toBe(240);
        expect(result.posterDataUrl).toMatch(/^data:image\/jpeg;base64,/);
        expect(existsSync(result.finalVideoPath)).toBe(true);
    }, 30000);
});
