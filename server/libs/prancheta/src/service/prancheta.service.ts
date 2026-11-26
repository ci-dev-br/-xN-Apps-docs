import { Injectable } from "@nestjs/common";
import { Prancheta } from "../models/prancheta.entity";
import { Equal, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { FullAuditedEntity, SnapshotService } from "@ci/manager";

@Injectable()
export class PranchetaService {
    constructor(
        @InjectRepository(Prancheta)
        private readonly prancheta_reppository: Repository<Prancheta>,
        private readonly _snap: SnapshotService,
    ) { }

    async sincronize(
        prancheta_untastemented: Prancheta,
        options: {
            tenant?: string,
            req?: any,
        }
    ) {
        let prancheta_current: Prancheta;

        if (prancheta_untastemented.internalId) {
            prancheta_current = await this.prancheta_reppository.findOne({
                where: { internalId: prancheta_untastemented.internalId },
                relations: ['tenants', 'createdBy']
            });

            if (prancheta_current) {
                try {
                    Object.keys(prancheta_untastemented).forEach((p, i) => {
                        if (i > 1000) return;
                        if (prancheta_untastemented[p] !== undefined) {
                            prancheta_current[p] = prancheta_untastemented[p];
                        }
                    });
                } catch (error) {
                    console.trace(error);
                }
            } else {
                prancheta_current = this.prancheta_reppository.create({
                    ...prancheta_untastemented,
                    createdBy: { id: options.req?.chaveAcesso || options.req?.user?.id },
                    tenants: options.tenant ? [{ id: options.tenant } as any] : undefined
                });
            }
        } else {
            prancheta_current = this.prancheta_reppository.create({
                ...prancheta_untastemented,
                createdBy: { id: options.req?.chaveAcesso || options.req?.user?.id },
                tenants: options.tenant ? [{ id: options.tenant } as any] : undefined
            });
        }

        // Se o escopo for TENANT, vincula o tenant da sessão à prancheta
        if (prancheta_current.scope === 'TENANT' && options.tenant) {
            prancheta_current.tenants = [{ id: options.tenant } as any];
        }

        if (prancheta_current instanceof FullAuditedEntity) {
            this._snap.snapshot(prancheta_current, options.req, this.prancheta_reppository);
        }
        return await this.prancheta_reppository.save(prancheta_current);
    }

    async Get(
        options: {
            userId?: string,
            tenant?: string,
            globalCode?: string,
            scope?: 'USER' | 'TENANT',
        }
    ) {
        // 1. Busca por código global único
        if (options?.globalCode) {
            const globalBoard = await this.prancheta_reppository.findOne({
                where: { codigoGlobal: options.globalCode },
                relations: ['tenants', 'createdBy']
            });
            if (globalBoard) return globalBoard;
        }

        // 2. Se o usuário requisitou explicitamente escopo por TENANT
        if (options?.scope === 'TENANT' && options?.tenant) {
            const tenantBoard = await this.prancheta_reppository.createQueryBuilder('p')
                .leftJoinAndSelect('p.tenants', 't')
                .leftJoinAndSelect('p.createdBy', 'c')
                .where('t.id = :tenantId', { tenantId: options.tenant })
                .andWhere('p.scope = :scope', { scope: 'TENANT' })
                .getOne();
            if (tenantBoard) return tenantBoard;
        }

        // 3. Busca prancheta privada do usuário (scope === 'USER' ou padrão)
        if (options?.userId) {
            const userBoard = await this.prancheta_reppository.findOne({
                where: {
                    createdBy: {
                        identifiedUser: Equal(options.userId)
                    },
                    scope: 'USER'
                },
                relations: ['tenants', 'createdBy']
            });
            if (userBoard) return userBoard;
        }

        // 4. Se não tem prancheta privada, tenta carregar prancheta compartilhada com o tenant do usuário
        if (options?.tenant) {
            const sharedTenantBoard = await this.prancheta_reppository.createQueryBuilder('p')
                .leftJoinAndSelect('p.tenants', 't')
                .leftJoinAndSelect('p.createdBy', 'c')
                .where('t.id = :tenantId', { tenantId: options.tenant })
                .andWhere('p.scope = :scope', { scope: 'TENANT' })
                .getOne();
            if (sharedTenantBoard) return sharedTenantBoard;
        }

        // 5. Fallback: qualquer prancheta criada pelo usuário
        if (options?.userId) {
            return await this.prancheta_reppository.findOne({
                where: {
                    createdBy: {
                        identifiedUser: Equal(options.userId)
                    }
                },
                relations: ['tenants', 'createdBy']
            });
        }

        return null;
    }
}
