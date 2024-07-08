import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Photo } from "./models/photo.entity";
import { PhotoService } from "./service/photo.service";
import { PhotoController } from "./controller/photo.controller";
import { AuthModule } from "@ci/auth/auth.module";
import { CoreModule } from "@ci/core/core.module";
import { FileExplorerController } from "./controller/file-explorer.controller";
export const StorageEntities = [
    Photo,
];
@Module({
    imports: [
        TypeOrmModule.forFeature(StorageEntities),
        AuthModule,
        CoreModule,
    ],
    controllers: [
        PhotoController,
        FileExplorerController,
    ],
    providers: [
        PhotoService,
    ]
})
export class StorageModule { }
export {
    Photo,
}