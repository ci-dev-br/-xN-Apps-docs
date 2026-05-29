import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FilePermission } from "../models/file-permission.entity";
import { Equal, IsNull, Or, Repository } from "typeorm";
import { join } from "path";

@Injectable()
export class FilePermissionService {
    constructor(
        @InjectRepository(FilePermission)
        private readonly filePermissionRepo: Repository<FilePermission>,

    ) { }
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
                if (!!permissions) {
                    let file_path = file.indexOf('.') === 0 ? join(__dirname, '..', file) : file;
                    for (const permission of permissions) {
                        let permission_path = permission.path.indexOf('.') === 0 ? join(__dirname, '..', permission.path) : permission.path;
                        if (permission.type === 'GRANT' && file_path.indexOf(permission_path) === 0) {
                            return true;
                        }
                    }

                }
            }
            return false;
        } catch (error) {
            console.trace(error)
        }
    }
} 