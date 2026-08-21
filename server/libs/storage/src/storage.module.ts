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
import { File } from "./models/file.entity";
import { FileService } from "./service/file.service";
import { FileController } from "./controller/file.controller";
import { FileExplorerService } from "./models/file-explorer.service";
import { GitService } from "./service/git.service";
import { StorageCollection } from "./models/storage-collection.entity";
export const StorageEntities = [
    Photo,
    FilePermission,
    File,
    StorageCollection,
];
@Module({
    imports: [
        TypeOrmModule.forFeature(StorageEntities),
        CoreModule,
        forwardRef(() => TenantModule),
        forwardRef(() => ManagerModule),
        forwardRef(() => AuthModule),
    ],
    controllers: [
        PhotoController,
        FileController,
        FileExplorerController,
        VideoController,
    ],
    providers: [
        PhotoService,
        FileService,
        FilePermissionService,
        FileExplorerService,
        GitService,
    ],
    exports: [
        PhotoService,
        FilePermissionService,
        GitService,
    ]
})
export class StorageModule { }
// export {
//     Photo,
// }