import { BadRequestException, Injectable, NotFoundException, Optional } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FilePermission } from "../models/file-permission.entity";
import { DataSource, Equal, IsNull, Repository } from "typeorm";
import { existsSync } from "node:fs";
import { isAbsolute, join, resolve } from "path";
import { randomBytes } from "crypto";

export interface SysAdminRecipient {
    id: string;
    email?: string;
    fullName?: string;
    surname?: string;
    username?: string;
}

@Injectable()
export class FilePermissionService {
    constructor(
        @InjectRepository(FilePermission)
        private readonly filePermissionRepo: Repository<FilePermission>,
        @Optional()
        private readonly dataSource?: DataSource,
    ) { }

    public resolveTargetPath(targetPath: string): string {
        const cleaned = (targetPath || './').trim();
        let resolved: string;
        if (isAbsolute(cleaned)) {
            resolved = resolve(cleaned);
        } else {
            const cwdCandidate = resolve(process.cwd(), cleaned);
            const moduleCandidate = resolve(join(__dirname, '..'), cleaned);
            resolved = existsSync(cwdCandidate) ? cwdCandidate : (existsSync(moduleCandidate) ? moduleCandidate : cwdCandidate);
        }
        return resolved.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase() || '/';
    }

    private isPathWithin(targetPath: string, authorizedPath: string): boolean {
        if (!authorizedPath) return false;
        if (authorizedPath === '/') return true;
        if (authorizedPath.endsWith('/')) {
            return targetPath.startsWith(authorizedPath);
        }
        return targetPath === authorizedPath || targetPath.startsWith(authorizedPath + '/');
    }

    private async findUserPermissions(userId: string): Promise<FilePermission[]> {
        return await this.filePermissionRepo.find({
            where: [
                {
                    createdBy: {
                        identifiedUser: Equal(userId)
                    },
                },
                {
                    requestedByUserId: Equal(userId),
                },
                {
                    createdBy: IsNull(),
                    requestedByUserId: IsNull(),
                }
            ],
            order: {
                createdAt: 'DESC',
            }
        });
    }

    async grant(file: string, request: any) {
        try {
            const userId = request?.user?.id;
            if (!!this.filePermissionRepo && userId) {
                const permissions = await this.findUserPermissions(userId);
                if (!!permissions && file) {
                    const file_path = this.resolveTargetPath(file);
                    for (const permission of permissions) {
                        if (!permission?.path) continue;
                        if (permission.status === 'PENDING' || permission.status === 'DENIED') continue;
                        const permission_path = this.resolveTargetPath(permission.path);
                        if (
                            permission.role === 'GRANT' &&
                            this.isPathWithin(file_path, permission_path)
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

    async listMyPermissions(request: any) {
        const userId = request?.user?.id;
        if (!userId || !this.filePermissionRepo) {
            return {
                authorizedPaths: [],
                permissions: [],
                pendingRequests: [],
            };
        }
        const all = await this.findUserPermissions(userId);
        const permissions = all.filter(p => p.role === 'GRANT' && p.status !== 'PENDING' && p.status !== 'DENIED');
        const pendingRequests = all.filter(p => p.status === 'PENDING' && p.requestedByUserId === userId);
        const authorizedPaths = Array.from(
            new Set(permissions.map(p => (p.path || '').trim()).filter(Boolean))
        );
        return {
            authorizedPaths,
            permissions,
            pendingRequests,
        };
    }

    async findSysAdminUsers(): Promise<SysAdminRecipient[]> {
        if (!this.dataSource) return [];
        try {
            const repo = this.dataSource.getRepository('User');
            const rows = await repo
                .createQueryBuilder('u')
                .where(':role = ANY(u.roles)', { role: 'SYSADMIN' })
                .getMany();
            return (rows || []).map((u: any) => ({
                id: u.id,
                email: u.email,
                fullName: u.fullName,
                surname: u.surname,
                username: u.username,
            }));
        } catch {
            try {
                const rawRows = await this.dataSource.query(
                    `SELECT id, email, full_name AS "fullName", surname, username FROM "user" WHERE $1 = ANY(roles)`,
                    ['SYSADMIN']
                );
                return rawRows || [];
            } catch (err) {
                console.warn('[FilePermissionService] Falha ao buscar usuários SYSADMIN:', err);
                return [];
            }
        }
    }

    async createPermissionRequest(
        targetPath: string,
        reason: string | undefined,
        request: any,
    ): Promise<{ alreadyAuthorized: boolean; permission?: FilePermission }> {
        const user = request?.user;
        if (!user?.id) {
            throw new BadRequestException('Usuário autenticado não identificado.');
        }
        const cleanedPath = (targetPath || '').trim() || './';
        const alreadyGranted = await this.grant(cleanedPath, request);
        if (alreadyGranted) {
            return { alreadyAuthorized: true };
        }

        const normalizedTarget = this.resolveTargetPath(cleanedPath);
        const existingPending = await this.filePermissionRepo.find({
            where: {
                requestedByUserId: Equal(user.id),
                status: Equal('PENDING'),
            },
            order: { createdAt: 'DESC' },
        });
        const matchedPending = existingPending.find(
            p => p.path && this.resolveTargetPath(p.path) === normalizedTarget
        );

        if (matchedPending) {
            if (!matchedPending.requestToken) {
                matchedPending.requestToken = randomBytes(32).toString('hex');
            }
            if (reason && reason.trim()) {
                matchedPending.reason = reason.trim();
            }
            matchedPending.requestedByEmail = user.email || matchedPending.requestedByEmail;
            matchedPending.requestedByName = user.fullName || user.surname || user.username || user.email || matchedPending.requestedByName;
            const savedExisting = await this.filePermissionRepo.save(matchedPending);
            return { alreadyAuthorized: false, permission: savedExisting };
        }

        const entity = this.filePermissionRepo.create({
            role: 'DANY',
            status: 'PENDING',
            path: cleanedPath,
            requestToken: randomBytes(32).toString('hex'),
            requestedByUserId: user.id,
            requestedByEmail: user.email || undefined,
            requestedByName: user.fullName || user.surname || user.username || user.email || 'Usuário',
            reason: reason?.trim() || undefined,
            ...(request?.chaveAcesso ? { createdBy: { id: request.chaveAcesso } as any } : {}),
        });
        const saved = await this.filePermissionRepo.save(entity);
        return { alreadyAuthorized: false, permission: saved };
    }

    async getPermissionRequestByToken(token: string): Promise<FilePermission> {
        const cleanToken = (token || '').trim();
        if (!cleanToken) {
            throw new BadRequestException('Token de autorização não informado.');
        }
        const found = await this.filePermissionRepo.findOne({
            where: { requestToken: Equal(cleanToken) },
        });
        if (!found) {
            throw new NotFoundException('Solicitação de permissão não encontrada ou token inválido.');
        }
        return found;
    }

    async authorizeByTokenOrId(
        input: { token?: string; internalId?: string; decision?: 'GRANT' | 'DENY' },
        request: any,
    ) {
        const cleanToken = input?.token?.trim();
        const cleanId = input?.internalId?.trim();
        if (!cleanToken && !cleanId) {
            throw new BadRequestException('Informe o token ou internalId da solicitação.');
        }

        const found = await this.filePermissionRepo.findOne({
            where: cleanToken ? { requestToken: Equal(cleanToken) } : { internalId: Equal(cleanId!) },
        });

        if (!found) {
            throw new NotFoundException('Solicitação de permissão não encontrada.');
        }

        const isDeny = input?.decision === 'DENY';
        found.role = isDeny ? 'DANY' : 'GRANT';
        found.status = isDeny ? 'DENIED' : 'GRANTED';
        found.authorizedByUserId = request?.user?.id || undefined;
        found.authorizedAt = new Date();
        if (request?.chaveAcesso) {
            found.lastModifiedBy = { id: request.chaveAcesso } as any;
        }

        const saved = await this.filePermissionRepo.save(found);
        return {
            authorized: !isDeny,
            denied: isDeny,
            path: saved.path,
            status: saved.status,
            requestedByUserId: saved.requestedByUserId,
            requestedByEmail: saved.requestedByEmail,
            message: isDeny
                ? `Solicitação de acesso à pasta "${saved.path}" foi negada.`
                : `Acesso à pasta "${saved.path}" autorizado com sucesso.`,
        };
    }
}
