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
export const StorageEntities = [
    Photo,
    FilePermission,
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
        FileExplorerController,
        VideoController,
    ],
    providers: [
        PhotoService,
        FilePermissionService,
    ],
    exports: [
        PhotoService,
        FilePermissionService,
    ]
})
export class StorageModule { }
// export {
//     Photo,
// }