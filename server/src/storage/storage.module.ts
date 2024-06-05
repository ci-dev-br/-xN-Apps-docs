import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Photo } from "./models/photo.entity";
import { PhotoService } from "./service/photo.service";
import { PhotoController } from "./controller/photo.controller";
import { AuthModule } from "src/auth/auth.module";
import { CoreModule } from "src/core/core.module";

export const StorageEntities = [
    Photo,
]

@Module({
    imports: [
        TypeOrmModule.forFeature(StorageEntities),
        AuthModule,
        CoreModule,
    ],
    controllers: [
        PhotoController,
    ],
    providers: [
        PhotoService,
    ]
})
export class StorageModule { }