import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Photo } from "../models/photo.entity";
import { Repository } from "typeorm";
interface PartialData {
    parts: string[];
}
@Injectable()
export class PhotoService {
    private static partialDataSendingBook = new Map<string, PartialData>();
    constructor(
        @InjectRepository(Photo)
        private readonly userRepo: Repository<Photo>,
    ) { }
    async Sync(photo: Photo) {
        try {
            let rawFile = photo?.originalFile as any;
            if (typeof rawFile === 'string' && rawFile.includes('base64,')) {
                rawFile = rawFile.split('base64,')[1];
            }
            const buffer = rawFile instanceof Buffer ? rawFile : (rawFile ? Buffer.from(rawFile, 'base64') : null);

            if (photo?.internalId) {
                const photo_exists = await this.userRepo.findOne({ where: { internalId: photo.internalId } });
                if (photo_exists) {
                    photo_exists.originalFile = buffer;
                    if (photo.format) photo_exists.format = photo.format;
                    return await this.userRepo.save(photo_exists, { reload: true });
                }
            }
            const nova_photo = this.userRepo.create();
            nova_photo.originalFile = buffer;
            nova_photo.format = photo?.format || 'image/jpeg';
            return await this.userRepo.save(nova_photo, { reload: true, listeners: true, transaction: true });
        } catch (error) {
            console.trace(error);
            throw error;
        }
    }
    async Get(query: string,) {
        try {
            return await this.userRepo.find({
                where: {
                }
            })
        } catch (error) {
            console.trace(error);
        }
    }
    async sendingPartialData(
        md5Part?: string,
        md5Full?: string,
        partialBase64?: string,
        currentPart?: number,
        TotalParts?: number,
    ) {
        try {
            let data: PartialData;
            if (PhotoService.partialDataSendingBook.has(md5Full)) {
                data = PhotoService.partialDataSendingBook.get(md5Full);
            } else {
                data = {
                    parts: Array(TotalParts).fill(undefined)
                };
                PhotoService.partialDataSendingBook.set(md5Full, data);
            }
            data.parts[currentPart] = partialBase64;
            if (data.parts.filter(d => d === undefined).length === 0) {
                PhotoService.partialDataSendingBook.delete(md5Full);
                const result_data = Buffer.from(data.parts.reduce((a, b) => a + b), 'base64');
                return result_data;
            }
        } catch (error) {
            console.trace(error);
        }

    }
}