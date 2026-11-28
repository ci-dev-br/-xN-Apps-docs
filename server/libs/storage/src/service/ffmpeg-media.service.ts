import { Injectable, Logger } from "@nestjs/common";
import * as ffmpeg from "fluent-ffmpeg";
import * as ffmpegStatic from "ffmpeg-static";
import * as ffprobeStatic from "ffprobe-static";
import { existsSync } from "node:fs";
import * as fs from "node:fs/promises";
import { join } from "node:path";

export interface VideoProbeMetadata {
    durationSeconds: number;
    durationLabel: string;
    width?: number;
    height?: number;
    videoCodec?: string;
    audioCodec?: string;
    bitrate?: number;
    formatName?: string;
    hasAudio: boolean;
    hasVideo: boolean;
}

export interface FfmpegProcessedVideoResult {
    finalVideoPath: string;
    posterPath?: string;
    posterDataUrl?: string;
    transcoded: boolean;
    sizeBytes: number;
    metadata: VideoProbeMetadata;
}

@Injectable()
export class FfmpegMediaService {
    private readonly logger = new Logger(FfmpegMediaService.name);
    private ffmpegBinaryPath?: string;
    private ffprobeBinaryPath?: string;

    constructor() {
        this.configureBinaries();
    }

    private configureBinaries(): void {
        try {
            const staticFfmpeg = (ffmpegStatic as any)?.default || (ffmpegStatic as unknown as string);
            if (typeof staticFfmpeg === 'string' && existsSync(staticFfmpeg)) {
                this.ffmpegBinaryPath = staticFfmpeg;
                ffmpeg.setFfmpegPath(staticFfmpeg);
            }
        } catch (err) {
            this.logger.warn(`Não foi possível resolver ffmpeg-static: ${err?.message || err}`);
        }

        try {
            const staticFfprobe = (ffprobeStatic as any)?.path || (ffprobeStatic as any)?.default?.path;
            if (typeof staticFfprobe === 'string' && existsSync(staticFfprobe)) {
                this.ffprobeBinaryPath = staticFfprobe;
                ffmpeg.setFfprobePath(staticFfprobe);
            }
        } catch (err) {
            this.logger.warn(`Não foi possível resolver ffprobe-static: ${err?.message || err}`);
        }
    }

    formatDuration(totalSeconds?: number): string {
        const secs = Math.max(0, Math.round(Number(totalSeconds) || 0));
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        if (h > 0) {
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    async probeVideo(filePath: string): Promise<VideoProbeMetadata> {
        return new Promise((resolve) => {
            ffmpeg.ffprobe(filePath, (err, data) => {
                if (err || !data) {
                    this.logger.warn(`ffprobe falhou para ${filePath}: ${err?.message || 'sem dados'}`);
                    resolve({
                        durationSeconds: 0,
                        durationLabel: '00:00',
                        hasAudio: false,
                        hasVideo: true,
                    });
                    return;
                }
                const streams = Array.isArray(data.streams) ? data.streams : [];
                const videoStream = streams.find(s => s.codec_type === 'video');
                const audioStream = streams.find(s => s.codec_type === 'audio');
                const durationSeconds = Number(data.format?.duration || videoStream?.duration || 0) || 0;
                resolve({
                    durationSeconds,
                    durationLabel: this.formatDuration(durationSeconds),
                    width: videoStream?.width,
                    height: videoStream?.height,
                    videoCodec: videoStream?.codec_name,
                    audioCodec: audioStream?.codec_name,
                    bitrate: data.format?.bit_rate ? Number(data.format.bit_rate) : undefined,
                    formatName: data.format?.format_name,
                    hasAudio: Boolean(audioStream),
                    hasVideo: Boolean(videoStream),
                });
            });
        });
    }

    async generateThumbnail(inputPath: string, outputJpgPath: string, durationSeconds?: number): Promise<boolean> {
        const seekSeconds = durationSeconds && durationSeconds > 2
            ? Math.min(5, Math.max(1, Math.floor(durationSeconds * 0.12)))
            : 0;

        return new Promise((resolve) => {
            ffmpeg(inputPath)
                .inputOptions([`-ss ${seekSeconds}`])
                .outputOptions([
                    '-vframes 1',
                    "-vf scale='min(640,iw)':-2",
                    '-q:v 4',
                    '-y',
                ])
                .output(outputJpgPath)
                .on('end', () => resolve(existsSync(outputJpgPath)))
                .on('error', (err) => {
                    this.logger.warn(`Falha ao gerar miniatura com ffmpeg (${inputPath}): ${err?.message || err}`);
                    resolve(false);
                })
                .run();
        });
    }

    async transcodeToWebMp4(inputPath: string, outputMp4Path: string, hasAudio: boolean): Promise<boolean> {
        return new Promise((resolve) => {
            const outputOpts = [
                '-c:v libx264',
                '-preset veryfast',
                '-crf 24',
                '-pix_fmt yuv420p',
                "-vf scale='min(1280,iw)':-2",
                '-movflags +faststart',
                '-y',
            ];
            if (hasAudio) {
                outputOpts.push('-c:a aac', '-b:a 128k', '-ac 2');
            } else {
                outputOpts.push('-an');
            }

            ffmpeg(inputPath)
                .outputOptions(outputOpts)
                .output(outputMp4Path)
                .on('end', () => resolve(existsSync(outputMp4Path)))
                .on('error', (err) => {
                    this.logger.warn(`Falha na transcodificação ffmpeg (${inputPath}): ${err?.message || err}`);
                    resolve(false);
                })
                .run();
        });
    }

    async processUploadedVideo(
        inputPath: string,
        assetDir: string,
        shouldTranscode = true,
    ): Promise<FfmpegProcessedVideoResult> {
        const initialMeta = await this.probeVideo(inputPath);
        const outputMp4Path = join(assetDir, 'video-web.mp4');
        const posterPath = join(assetDir, 'poster.jpg');

        let finalVideoPath = inputPath;
        let transcoded = false;
        let finalMeta = initialMeta;

        const isAlreadyWebMp4 =
            inputPath.toLowerCase().endsWith('.mp4') &&
            initialMeta.videoCodec === 'h264' &&
            (!initialMeta.hasAudio || initialMeta.audioCodec === 'aac') &&
            (!initialMeta.width || initialMeta.width <= 1280);

        if (shouldTranscode && initialMeta.hasVideo && !isAlreadyWebMp4) {
            const ok = await this.transcodeToWebMp4(inputPath, outputMp4Path, initialMeta.hasAudio);
            if (ok) {
                finalVideoPath = outputMp4Path;
                transcoded = true;
                finalMeta = await this.probeVideo(outputMp4Path);
            }
        } else if (shouldTranscode && isAlreadyWebMp4) {
            // Garante faststart copiando os streams para container MP4 otimizado
            const remuxed = await this.remuxFastStart(inputPath, outputMp4Path);
            if (remuxed) {
                finalVideoPath = outputMp4Path;
                transcoded = true;
            }
        }

        const thumbOk = initialMeta.hasVideo
            ? await this.generateThumbnail(finalVideoPath, posterPath, finalMeta.durationSeconds)
            : false;

        let posterDataUrl: string | undefined;
        if (thumbOk && existsSync(posterPath)) {
            const thumbBuf = await fs.readFile(posterPath);
            posterDataUrl = `data:image/jpeg;base64,${thumbBuf.toString('base64')}`;
        }

        const stats = await fs.stat(finalVideoPath);
        return {
            finalVideoPath,
            posterPath: thumbOk ? posterPath : undefined,
            posterDataUrl,
            transcoded,
            sizeBytes: stats.size,
            metadata: finalMeta,
        };
    }

    private async remuxFastStart(inputPath: string, outputMp4Path: string): Promise<boolean> {
        return new Promise((resolve) => {
            ffmpeg(inputPath)
                .outputOptions(['-c copy', '-movflags +faststart', '-y'])
                .output(outputMp4Path)
                .on('end', () => resolve(existsSync(outputMp4Path)))
                .on('error', () => resolve(false))
                .run();
        });
    }

    getBinaryDiagnostics(): { ffmpeg?: string; ffprobe?: string } {
        return {
            ffmpeg: this.ffmpegBinaryPath,
            ffprobe: this.ffprobeBinaryPath,
        };
    }
}
