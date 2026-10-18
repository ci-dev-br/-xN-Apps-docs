import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FilePermission } from "../models/file-permission.entity";
import { Equal, IsNull, Repository } from "typeorm";
import { isAbsolute, join, resolve } from "path";

@Injectable()
export class FilePermissionService {
    constructor(
        @InjectRepository(FilePermission)
        private readonly filePermissionRepo: Repository<FilePermission>,
    ) { }

    private resolveTargetPath(targetPath: string): string {
        const baseDir = join(__dirname, '..');
        const cleaned = (targetPath || './').trim();
        const resolved = isAbsolute(cleaned)
            ? resolve(cleaned)
            : resolve(baseDir, cleaned);
        return resolved.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase();
    }

    async grant(file: string, request: any) {
        try {
            if (!!this.filePermissionRepo && request) {
                let permissions = await this.filePermissionRepo.find({
                    where: [{
                        createdBy: {
                            identifiedUser: Equal(request.user.id)
                        },
                    },
                    {
                        createdBy: IsNull()
                    }
                    ]
                });
                if (!!permissions && file) {
                    const file_path = this.resolveTargetPath(file);
                    for (const permission of permissions) {
                        if (!permission?.path) continue;
                        const permission_path = this.resolveTargetPath(permission.path);
                        if (
                            permission.type === 'GRANT' &&
                            (file_path === permission_path || file_path.startsWith(permission_path + '/'))
                        ) {
                            return true;
                        }
                    }
                }
            }
            return false;
        } catch (error) {
            console.trace(error);
            return false;
        }
    }
}