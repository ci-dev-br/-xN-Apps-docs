import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Photo } from "./models/photo";

export const StorageEntities = [
    Photo,
]

@Module({
    imports: [
        TypeOrmModule.forFeature()
    ]
})
export class StorageModule { }