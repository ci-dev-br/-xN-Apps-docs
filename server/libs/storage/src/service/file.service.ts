import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { File } from "../models/file.entity";
import { Repository } from "typeorm";
interface PartialData {
    parts: string[];
}
@Injectable()
export class FileService {
    private static partialDataSendingBook = new Map<string, PartialData>();
    constructor(
        @InjectRepository(File)
        private readonly userRepo: Repository<File>,
    ) { }
    async Sync(photo: File) {
        try {
            if (photo?.internalId) {
                const photo_exists = await this.userRepo.findOne({ where: { internalId: photo.internalId } });
                /* if (photo_exists) {
                    photo_exists.originalFile = photo.originalFile instanceof Buffer ? photo.originalFile : Buffer.from(photo.originalFile as any, 'base64');
                    photo_exists.format = photo.format;
                    // photo_exists.lastModifiedBy = photo.lastModifiedBy;
                    return await this.userRepo.save(photo_exists, { reload: true });
                } */
            } else {
                /*  const nova_photo = await this.userRepo.create();
                 nova_photo.originalFile = photo.originalFile instanceof Buffer ? photo.originalFile : Buffer.from(photo.originalFile as any, 'base64');
                 nova_photo.format = photo.format;
                 // nova_photo.createdBy = photo.createdBy;
                 return await this.userRepo.save(nova_photo, { reload: true, listeners: true, transaction: true }); */
            }
        } catch (error) {
            console.trace(error);
        }
    }
    async Get(query: string,) {
        try {
            return await this.userRepo.find({
                where: {
                }
            })
        } catch (error) {
            console.trace(error)
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
            if (FileService.partialDataSendingBook.has(md5Full)) {
                data = FileService.partialDataSendingBook.get(md5Full);
            } else {
                data = {
                    parts: Array(TotalParts).fill(undefined)
                };
                FileService.partialDataSendingBook.set(md5Full, data);
            }
            data.parts[currentPart] = partialBase64;
            if (data.parts.filter(d => d === undefined).length === 0) {
                FileService.partialDataSendingBook.delete(md5Full);
                const result_data = Buffer.from(data.parts.reduce((a, b) => a + b), 'base64');
                return result_data;
            }
        } catch (error) {
            console.trace(error)
        }
    }
}