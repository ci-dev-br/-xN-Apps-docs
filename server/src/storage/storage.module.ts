import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Photo } from "./models/photo.entity";

export const StorageEntities = [
    Photo,
]

@Module({
    imports: [
        TypeOrmModule.forFeature(StorageEntities)
    ]
})
export class StorageModule { }