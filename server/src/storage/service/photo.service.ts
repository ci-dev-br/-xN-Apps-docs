import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Photo } from "../models/photo.entity";
import { Repository } from "typeorm";

@Injectable()
export class PhotoService {
    constructor(
        @InjectRepository(Photo)
        private readonly userRepo: Repository<Photo>,
    ) { }

    async Sync(photo: Photo) {
        console.log(photo);
        if (photo?.internalId) {
            const photo_exists = await this.userRepo.findOne({ where: { internalId: photo.internalId } });

            if (photo_exists) {
                photo_exists.originalFile = Buffer.from(photo.originalFile as any, 'base64');
                return await this.userRepo.save(photo_exists);
            }
        } else {
            const nova_photo = await this.userRepo.create();
            nova_photo.originalFile = Buffer.from(photo.originalFile as any, 'base64');
            return await this.userRepo.save(nova_photo);
        }
    }
    async Get(query: string,) {
        return await this.userRepo.find({
            where: {

            }
        })
    }
}