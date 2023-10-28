import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

export const StorageEntities = [
    Photo,
]

@Module({
    imports: [
        TypeOrmModule.forFeature()
    ]
})
export class StorageModule{}