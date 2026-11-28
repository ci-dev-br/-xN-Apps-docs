import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Photo } from "./models/photo.entity";
import { PhotoService } from "./service/photo.service";
import { PhotoController } from "./controller/photo.controller";
import { CoreModule } from "@ci/core/core.module";
import { FileExplorerController } from "./controller/file-explorer.controller";
import { VideoController } from "./controller/video.controller";
import { FilePermission } from "./models/file-permission.entity";
import { FilePermissionService } from "./service/file-permission.service";
import { TenantModule } from "@ci/tenant";
import { AuthModule } from "@ci/auth/auth.module";
import { ManagerModule } from "@ci/manager";
import { NotificacaoModule } from "@ci/notification";
import { File } from "./models/file.entity";
import { FileService } from "./service/file.service";
import { FileController } from "./controller/file.controller";
import { FileExplorerService } from "./models/file-explorer.service";
import { GitService } from "./service/git.service";
import { StorageCollection } from "./models/storage-collection.entity";
import { StorageAsset } from "./models/storage-asset.entity";
import { StorageMediaController } from "./controller/storage-media.controller";
import { StorageMediaService } from "./service/storage-media.service";
import { FfmpegMediaService } from "./service/ffmpeg-media.service";
export const StorageEntities = [
    Photo,
    FilePermission,
    File,
    StorageCollection,
    StorageAsset,
];
@Module({
    imports: [
        TypeOrmModule.forFeature(StorageEntities),
        CoreModule,
        forwardRef(() => TenantModule),
        forwardRef(() => ManagerModule),
        forwardRef(() => AuthModule),
        forwardRef(() => NotificacaoModule),
    ],
    controllers: [
        PhotoController,
        FileController,
        FileExplorerController,
        VideoController,
        StorageMediaController,
    ],
    providers: [
        PhotoService,
        FileService,
        FilePermissionService,
        FileExplorerService,
        GitService,
        FfmpegMediaService,
        StorageMediaService,
    ],
    exports: [
        PhotoService,
        FilePermissionService,
        FileExplorerService,
        GitService,
        FfmpegMediaService,
        StorageMediaService,
    ]
})
export class StorageModule { }
// export {
//     Photo,
// }