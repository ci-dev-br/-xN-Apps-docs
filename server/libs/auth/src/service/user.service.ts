import { Injectable, NotFoundException, BadRequestException, ForbiddenException, UnauthorizedException, Optional } from '@nestjs/common';
import { User } from '../models/user.entity';
import { DataSource, Equal, FindOptionsWhere, In, Repository, IsNull } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Credential } from '@ci/core';
import { createHash } from 'crypto';
import { request } from 'https';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PhotoService } from '@ci/storage/service/photo.service';
import { Tenant } from '@ci/tenant/models/tenant.entity';
import { TenantService } from '@ci/tenant/service/tenant.service';
@Injectable()
export class UserService {
    constructor(
        @Optional() private readonly dataSource: DataSource,
        @InjectRepository(User)
        @Optional() private readonly userRepo: Repository<User>,
        @Optional() private readonly photos: PhotoService,
        @Optional() private readonly tenantService?: TenantService,
        // private readonly mailer: MailService,
    ) { }
    async registrar(registro: User) {
        if (!registro.roles || !Array.isArray(registro.roles) || registro.roles.length === 0) {
            registro.roles = ['USER'];
        } else if (!registro.roles.includes('USER')) {
            registro.roles = ['USER', ...registro.roles];
        }

        if (Array.isArray(registro.tenants) && registro.tenants.length > 0) {
            const tenantIds = registro.tenants.map(t => t?.id).filter(Boolean) as string[];
            registro.tenants = await this.resolveTenantEntitiesByIds(tenantIds);
        }

        const user_created = await this.dataSource.transaction(async (manager) => {
            const new_user = this.userRepo.create(registro);
            return await manager.save(new_user, { transaction: true, reload: true });
        });

        // Garante que o aplicativo da Loja esteja ativo por padrão para o novo usuário
        await this.ensureLojaActiveForUser(user_created.id);

        // Envio de confirmação em background sem bloquear ou reverter a transação
        if (user_created?.email) {
            this.sendEmailConfirmation(user_created).catch((err) => {
                console.warn('[UserService] Aviso ao enviar confirmação de cadastro:', err?.message || err);
            });
        }

        return user_created;
    }

    /**
     * Garante que a aplicação 'Loja' exista no catálogo e esteja ativada na conta do usuário.
     */
    async ensureLojaActiveForUser(userId?: string) {
        if (!userId || !this.dataSource) return;
        try {
            const appRows = await this.dataSource.query(
                `SELECT id FROM "Management"."application" WHERE app_key = 'Loja' OR route_path = '/Loja' OR name = 'Loja' LIMIT 1`
            );
            let lojaAppId = appRows?.[0]?.id;
            if (!lojaAppId) {
                const inserted = await this.dataSource.query(
                    `INSERT INTO "Management"."application" (app_key, route_path, url, name, description, icon, categoria, roles, is_active)
                     VALUES ('Loja', '/Loja', '/Loja', 'Loja', 'Loja de Aplicativos da Plataforma', 'storefront', 'System', ARRAY['USER', 'ADMIN', 'MASTER'], true)
                     RETURNING id`
                );
                lojaAppId = inserted?.[0]?.id;
            }
            if (lojaAppId) {
                const existingLink = await this.dataSource.query(
                    `SELECT 1 FROM "Management"."application_users_user" WHERE application_id = $1 AND user_id = $2 LIMIT 1`,
                    [lojaAppId, userId]
                );
                if (!existingLink || existingLink.length === 0) {
                    await this.dataSource.query(
                        `INSERT INTO "Management"."application_users_user" (application_id, user_id) VALUES ($1, $2)`,
                        [lojaAppId, userId]
                    );
                }
            }
        } catch (err: any) {
            console.warn('[UserService] Aviso ao ativar aplicativo Loja para o usuário:', err?.message || err);
        }
    }
    async serdMailTemplate(template_html, message_data?: any) {

    }
    async sendEmailConfirmation(registro: User) {
        return await new Promise<void>((res, rej) => {
            try {
            const template_data = {
                ano: null,
                logo_base64: null,
            }
            let data = {
                ano: (new Date()).getFullYear().toString(),
                mail_sender_status: 'Você está recebendo e-mails do Apps.ci.dev.br.',
                nome: registro.fullName,
                mail_confirmation_link: 'https://apps.ci.dev.br/?unsubscrible=zyx',
                apelidio: registro.fullName,
                unsubscrible_link: 'https://apps.ci.dev.br/?unsubscrible=zyx',
                footer_assinatura: 'ci.dev.br - ci.dev.br especialistas em lançamento de aplicativos sob demanda.',
                footer_message: 'ci.dev.br - Sediada em Curitiba, Paraná, Brasil.<br/> Apps é ci.dev.br.',
            };
            let send_mail_request_body = JSON.stringify({
                x: createHash('sha256').update(process.env.mailer_key + '.' + registro.email.trim() + '.apps.ci.dev.br').digest('hex'),
                to: registro.email.trim(),
                from: 'contact@ci.dev.br',
                subject: 'Confirmação de Cadastro',
                message: (() => {
                    let template_html = readFileSync(join(__dirname, '/../', 'templates/mail-template.html')).toString('utf-8');
                    Object.keys(data).forEach(property_name => (template_html = template_html.replaceAll(`{{${property_name}}}`, data[property_name])));
                    return template_html;
                })(),
            });
            let req = request({
                host: 'mailer.xx.app.br',
                port: 443,
                method: 'POST',
                path: '/mailer/send/',
                headers: {
                    'Content-Length': Buffer.byteLength(send_mail_request_body),
                    'Content-type': 'application/json',
                }
            }, (result) => {
                result.on('data', (result_data) => {
                    if (result_data) {
                        console.log(result_data.toString());
                        try {
                            const response_json = JSON.parse(result_data.toString());
                            if (response_json.status !== 200) {
                                rej(new Error('Falha no envio do e-mail de confirmação.\n' + (response_json.message || '')))
                            } else {
                                res();
                            }
                        } catch (e: any) {

                            rej(new Error('Falha no envio do e-mail de confirmação.\n' + (e?.message || '')))
                        }
                    }
                });
                result.on('end', () => {
                    console.log('No more data in response.');
                });
            });
                req.on('error', (err) => {
                    console.warn('[UserService] Aviso na requisição de e-mail:', err?.message || err);
                    res();
                });
                req.write(send_mail_request_body);
                req.end();
            } catch (err) {
                res();
            }
        });
    }
    async solicitarAcesso(informacaoAcesso: { identificador?: string }) {
    }
    async existsUserByIdentification(identification: string, fator: string) {
        return await this.userRepo.createQueryBuilder('user')
            .where(`encode(sha512(concat(user.username,:fator::varchar)::bytea), 'hex') = :assinatura::varchar
                 or (user.email is not null and encode(sha512(concat(user.email,:fator::varchar)::bytea), 'hex') = :assinatura::varchar)
                 or (user.email is not null and encode(sha512(concat(lower(user.email),:fator::varchar)::bytea), 'hex') = :assinatura::varchar)
                 or (user.username is not null and encode(sha512(concat(lower(user.username),:fator::varchar)::bytea), 'hex') = :assinatura::varchar)`)
            .setParameters(
                {
                    assinatura: identification, fator: fator
                })
            .getOne()
            ;
    }
    async verificarAssinaturaAutenticacao(
        userId: string,
        assinaturaPassword: string,
        chaveAcesso: string,
    ) {
        try {
            const user = await this.userRepo.findOne({
                where: { id: Equal(userId), passwordMode: Equal('argon2') }
            });
            if (!!user) {
                if (await argon2.verify(user.password, assinaturaPassword)) {
                    delete user.password;
                    return user;
                }
            } else {
                return await this.userRepo.createQueryBuilder('user')
                    .leftJoinAndSelect('user.photo', 'photo')
                    .leftJoinAndSelect('user.tenants', 'tenant')
                    .where(`"user".id::varchar = :user_id::varchar and encode(sha512(concat(encode(sha512("user".password::bytea),'hex'), :chave_acesso::varchar )::bytea),'hex') = :ass_pass::varchar`)
                    .setParameter('user_id', userId)
                    .setParameter('ass_pass', assinaturaPassword)
                    .setParameter('chave_acesso', chaveAcesso)
                    .getOne()
            }
        } catch (error) { console.trace(error); }
    }
    hashData(data: string) {
        try {
            return argon2.hash(data);
        } catch (error) { console.trace(error); }
    }
    async logout(user: User) {
        try {
            return await this.userRepo.update(user.id, {
                refreshToken: null
            })
        } catch (error) { console.trace(error); }
    }
    async updateRefreshToken(userId: string, refreshToken: string, chave?: Credential) {
        try {
            const hashedRefreshToken = await this.hashData(refreshToken);
            return hashedRefreshToken;
            // TODO:  implementar verificação do hash do RefrashToken ...
        } catch (error) { console.trace(error); }
    }
    async findById(userId: string) {
        try {
            const user = await this.userRepo.findOne({
                where: { id: userId },
                relations: [/* 'photo',  */
                    'tenants',
                    'photo'
                ]
            });
            if (user?.photo?.originalFile) {
                if (Buffer.isBuffer(user.photo.originalFile)) {
                    user.photo.originalFile = user.photo.originalFile.toString('base64') as any;
                }
            }
            if (user) {
                delete user.password;
                delete user.refreshToken;
            }
            return user;
        } catch (error) { console.trace(error); }
    }
    async findByIdLight(userId: string) {
        try {
            if (!userId) return undefined;
            return await this.userRepo.findOne({
                where: { id: userId },
                relations: ['tenants']
            });
        } catch (error) { console.trace(error); }
    }
    private getActorRoles(actor?: User): string[] {
        return Array.isArray(actor?.roles)
            ? actor.roles.map(r => (r || '').trim().toUpperCase()).filter(Boolean)
            : [];
    }

    private isMasterActor(actor?: User): boolean {
        const roles = this.getActorRoles(actor);
        return roles.includes('MASTER') || roles.includes('GOODNESS');
    }

    private isAdminActor(actor?: User): boolean {
        return this.getActorRoles(actor).includes('ADMIN');
    }

    private async getManageableTenantIds(actor?: User): Promise<string[]> {
        if (!actor?.id) return [];
        if (this.tenantService) {
            const available = await this.tenantService.listarTenantsDisponiveis(actor);
            return Array.from(new Set((available || []).map(t => t?.id).filter(Boolean) as string[]));
        }
        return Array.from(new Set((actor.tenants || []).map(t => t?.id).filter(Boolean) as string[]));
    }

    private async resolveTenantEntitiesByIds(ids: string[]): Promise<Tenant[]> {
        const cleanIds = Array.from(new Set((ids || []).map(id => (id || '').trim()).filter(Boolean)));
        if (cleanIds.length === 0) return [];
        if (this.dataSource && typeof this.dataSource.getRepository === 'function') {
            try {
                const tenantRepo = this.dataSource.getRepository(Tenant);
                if (tenantRepo && typeof tenantRepo.find === 'function') {
                    return await tenantRepo.find({ where: { id: In(cleanIds) } });
                }
            } catch {
                // fallback em testes unitários sem entidade Tenant registrada no mock
            }
        }
        return cleanIds.map(id => ({ id } as Tenant));
    }

    private sanitizeManagedUser(user: User, allowedTenantIdsForAdmin?: Set<string>): User {
        const cloned: any = { ...user };
        delete cloned.password;
        delete cloned.passwordMode;
        delete cloned.refreshToken;
        delete cloned.faceDescriptor;

        if (cloned.photo && typeof cloned.photo === 'object') {
            const photoClone: any = { ...cloned.photo };
            if (Buffer.isBuffer(photoClone.originalFile)) {
                photoClone.originalFile = photoClone.originalFile.toString('base64');
            }
            cloned.photo = photoClone;
        }

        if (Array.isArray(cloned.tenants)) {
            cloned.tenants = cloned.tenants
                .filter((t: Tenant) => !allowedTenantIdsForAdmin || (t?.id && allowedTenantIdsForAdmin.has(t.id)))
                .map((t: Tenant) => ({
                    id: t.id,
                    name: t.name,
                    descriptions: t.descriptions,
                    organizacaoId: t.organizacaoId,
                }));
        }

        return cloned as User;
    }

    /**
     * Sincronizar objeto de Usuário.
     * - Sem privilégio administrativo (ou sem ator): apenas auto-atualização segura do próprio usuário.
     * - MASTER / GOODNESS: gerenciamento global de usuários, papéis e tenants.
     * - ADMIN: gerenciamento restrito aos usuários vinculados aos tenants disponíveis para o administrador,
     *   sem permissão para elevar ou editar contas MASTER/GOODNESS.
     */
    async sync(data: User, actor?: User) {
        if (!data) {
            throw new BadRequestException('Dados do usuário não informados.');
        }

        const payload: User = { ...data };
        const isMaster = this.isMasterActor(actor);
        const isAdmin = this.isAdminActor(actor);
        const canManage = Boolean(actor && (isMaster || isAdmin));

        if (!canManage) {
            delete payload.password;
            delete payload.passwordMode;
            delete payload.refreshToken;
            delete payload.tenants;
            delete payload.roles;
            delete payload.permission;
            delete payload.emailVerificado;
            delete payload.faceDescriptor;

            let { id, ...changes } = payload;
            let data_ref = !!payload.id ? await this.userRepo.findOne({
                where: { id: payload.id },
                relations: { photo: true }
            }) : undefined;
            if (!data_ref) {
                data_ref = await this.userRepo.create(payload);
            } else if (
                changes.email !== undefined &&
                (changes.email || '').trim().toLowerCase() !== (data_ref.email || '').trim().toLowerCase()
            ) {
                (changes as any).emailVerificado = false;
            }
            if ('photo' in changes) {
                if (changes.photo) {
                    if (!changes.photo.internalId && data_ref?.photo?.internalId) {
                        changes.photo.internalId = data_ref.photo.internalId;
                    }
                    changes.photo = await this.photos.Sync(changes.photo);
                } else {
                    changes.photo = null;
                }
            }
            Object.assign(data_ref, changes);
            await this.userRepo.save(data_ref, { transaction: true });
            return await this.findById(data_ref.id);
        }

        // Modo gerencial (MASTER / ADMIN)
        delete payload.refreshToken;
        delete payload.faceDescriptor;

        if (typeof payload.password === 'string' && payload.password.trim().length > 0) {
            payload.password = await argon2.hash(payload.password.trim());
            payload.passwordMode = 'argon2';
        } else {
            delete payload.password;
            delete payload.passwordMode;
        }

        let allowedSet: Set<string> | undefined;
        if (!isMaster) {
            const allowedIds = await this.getManageableTenantIds(actor);
            if (allowedIds.length === 0) {
                throw new ForbiddenException('Nenhum tenant disponível para gerenciamento por este administrador.');
            }
            allowedSet = new Set(allowedIds);

            if (Array.isArray(payload.roles)) {
                const normalizedRoles = Array.from(
                    new Set(payload.roles.map(r => (r || '').trim().toUpperCase()).filter(Boolean)),
                );
                if (normalizedRoles.includes('MASTER') || normalizedRoles.includes('GOODNESS')) {
                    throw new ForbiddenException('Administradores de tenant não podem atribuir papéis MASTER ou GOODNESS.');
                }
                payload.roles = normalizedRoles.includes('USER') ? normalizedRoles : ['USER', ...normalizedRoles];
            }
        } else if (Array.isArray(payload.roles)) {
            const normalizedRoles = Array.from(
                new Set(payload.roles.map(r => (r || '').trim().toUpperCase()).filter(Boolean)),
            );
            payload.roles = normalizedRoles.includes('USER') ? normalizedRoles : ['USER', ...normalizedRoles];
        }

        const { id, ...changes } = payload;
        let data_ref = id
            ? await this.userRepo.findOne({
                where: { id },
                relations: { photo: true, tenants: true },
            })
            : undefined;

        if (id && !data_ref) {
            throw new NotFoundException('Usuário não encontrado.');
        }

        if (data_ref) {
            if (!isMaster) {
                const targetRoles = this.getActorRoles(data_ref);
                if (targetRoles.includes('MASTER') || targetRoles.includes('GOODNESS')) {
                    throw new ForbiddenException('Administradores de tenant não podem alterar contas MASTER.');
                }
                if (data_ref.id !== actor!.id) {
                    const sharesTenant = (data_ref.tenants || []).some(t => t?.id && allowedSet!.has(t.id));
                    if (!sharesTenant) {
                        throw new ForbiddenException('Você só pode gerenciar usuários pertencentes aos tenants disponíveis para o seu perfil.');
                    }
                }
            }

            if ('tenants' in payload && Array.isArray(payload.tenants)) {
                const requestedTenantIds = Array.from(
                    new Set(payload.tenants.map(t => t?.id).filter(Boolean) as string[]),
                );
                if (!isMaster) {
                    const existingIds = new Set((data_ref.tenants || []).map(t => t?.id).filter(Boolean) as string[]);
                    const unauthorizedId = requestedTenantIds.find(tid => !allowedSet!.has(tid) && !existingIds.has(tid));
                    if (unauthorizedId) {
                        throw new ForbiddenException('Você não possui permissão para vincular usuários a um ou mais tenants selecionados.');
                    }
                    const preservedExternalTenants = (data_ref.tenants || []).filter(
                        t => t?.id && !allowedSet!.has(t.id),
                    );
                    const managedTenantIds = requestedTenantIds.filter(tid => allowedSet!.has(tid));
                    const resolvedManaged = await this.resolveTenantEntitiesByIds(managedTenantIds);
                    changes.tenants = [...preservedExternalTenants, ...resolvedManaged];
                } else {
                    changes.tenants = await this.resolveTenantEntitiesByIds(requestedTenantIds);
                }
            }

            if (
                changes.email !== undefined &&
                (changes.email || '').trim().toLowerCase() !== (data_ref.email || '').trim().toLowerCase()
            ) {
                (changes as any).emailVerificado = false;
            }
            if ('photo' in changes) {
                if (changes.photo && this.photos) {
                    if (!changes.photo.internalId && data_ref?.photo?.internalId) {
                        changes.photo.internalId = data_ref.photo.internalId;
                    }
                    changes.photo = await this.photos.Sync(changes.photo);
                } else if (!changes.photo) {
                    changes.photo = null;
                }
            }
            Object.assign(data_ref, changes);
            await this.userRepo.save(data_ref, { transaction: true });
            const saved = await this.findById(data_ref.id);
            return saved ? this.sanitizeManagedUser(saved, isMaster ? undefined : allowedSet) : undefined;
        }

        // Criação de novo usuário em modo gerencial
        if (!payload.roles || payload.roles.length === 0) {
            payload.roles = ['USER'];
        }
        if (!isMaster) {
            const requestedTenantIds = Array.isArray(payload.tenants)
                ? Array.from(new Set(payload.tenants.map(t => t?.id).filter(Boolean) as string[]))
                : [];
            const unauthorizedId = requestedTenantIds.find(tid => !allowedSet!.has(tid));
            if (unauthorizedId) {
                throw new ForbiddenException('Você não possui permissão para cadastrar usuários fora dos tenants disponíveis.');
            }
            const effectiveTenantIds = requestedTenantIds.length > 0
                ? requestedTenantIds
                : [Array.from(allowedSet!)[0]];
            payload.tenants = await this.resolveTenantEntitiesByIds(effectiveTenantIds);
        } else if (Array.isArray(payload.tenants)) {
            const requestedTenantIds = Array.from(
                new Set(payload.tenants.map(t => t?.id).filter(Boolean) as string[]),
            );
            payload.tenants = await this.resolveTenantEntitiesByIds(requestedTenantIds);
        }

        const new_ref = this.userRepo.create(payload);
        await this.userRepo.save(new_ref, { transaction: true });
        await this.ensureLojaActiveForUser(new_ref.id);
        const created = await this.findById(new_ref.id);
        return created ? this.sanitizeManagedUser(created, isMaster ? undefined : allowedSet) : undefined;
    }

    /**
     * Marca o e-mail do usuário como verificado após validação do token de confirmação.
     */
    async confirmarEmailVerificado(userId: string, expectedEmail: string): Promise<{ user: User; alreadyVerified: boolean }> {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('Usuário não encontrado.');
        }

        const currentEmail = (user.email || '').trim().toLowerCase();
        const normalizedExpected = (expectedEmail || '').trim().toLowerCase();
        if (!currentEmail || currentEmail !== normalizedExpected) {
            throw new BadRequestException('Este link de confirmação não corresponde ao e-mail atual do usuário.');
        }

        if (user.emailVerificado) {
            return { user, alreadyVerified: true };
        }

        await this.userRepo.update(user.id, { emailVerificado: true });
        user.emailVerificado = true;
        return { user, alreadyVerified: false };
    }

    /**
     * Lista usuários visíveis ao solicitante:
     * - MASTER / GOODNESS: acesso global (com filtro opcional por tenants, papel ou busca).
     * - ADMIN: acesso restrito aos usuários pertencentes aos tenants disponíveis para ele.
     */
    async find(
        tenants?: string[],
        request?: { user: User },
        filter?: { role?: string; search?: string },
    ): Promise<User[] | undefined> {
        if (!request?.user) {
            throw new UnauthorizedException('Acesso negado.');
        }

        const isMaster = this.isMasterActor(request.user);
        const isAdmin = this.isAdminActor(request.user);

        if (!isMaster && !isAdmin) {
            throw new ForbiddenException('Acesso negado. Apenas usuários MASTER ou ADMIN podem listar usuários.');
        }

        const requestedTenantIds = Array.from(
            new Set((tenants || []).map(id => (id || '').trim()).filter(Boolean)),
        );

        let allowedSet: Set<string> | undefined;
        let effectiveTenantFilter: string[] | undefined =
            requestedTenantIds.length > 0 ? requestedTenantIds : undefined;

        if (!isMaster) {
            const allowedIds = await this.getManageableTenantIds(request.user);
            if (allowedIds.length === 0) {
                return [];
            }
            allowedSet = new Set(allowedIds);
            if (requestedTenantIds.length > 0) {
                const unauthorized = requestedTenantIds.find(tid => !allowedSet!.has(tid));
                if (unauthorized) {
                    throw new ForbiddenException('Você não possui acesso a um ou mais tenants solicitados.');
                }
                effectiveTenantFilter = requestedTenantIds;
            } else {
                effectiveTenantFilter = allowedIds;
            }
        }

        const allUsers = await this.userRepo.find({
            relations: { photo: true, tenants: true },
            order: { createdAt: 'DESC' } as any,
        });

        const normalizedRoleFilter = (filter?.role || '').trim().toUpperCase();
        const normalizedSearch = (filter?.search || '').trim().toLowerCase();
        const filterSet = effectiveTenantFilter ? new Set(effectiveTenantFilter) : undefined;

        return (allUsers || [])
            .filter(u => {
                if (filterSet) {
                    const hasTenant = (u.tenants || []).some(t => t?.id && filterSet.has(t.id));
                    if (!hasTenant) return false;
                }
                if (normalizedRoleFilter) {
                    const userRoles = this.getActorRoles(u);
                    if (!userRoles.includes(normalizedRoleFilter)) return false;
                }
                if (normalizedSearch) {
                    const haystack = [u.fullName, u.surname, u.username, u.email, u.phone]
                        .filter(Boolean)
                        .join(' ')
                        .toLowerCase();
                    if (!haystack.includes(normalizedSearch)) return false;
                }
                return true;
            })
            .map(u => this.sanitizeManagedUser(u, isMaster ? undefined : allowedSet));
    }

    /**
     * Vincula um usuário existente (por userId ou e-mail/username) a um Tenant gerenciado.
     */
    async addUserToTenant(
        dto: { tenantId: string; userId?: string; emailOrUsername?: string; roles?: string[] },
        actor: User,
    ): Promise<User> {
        if (!actor?.id) {
            throw new UnauthorizedException('Usuário autenticado não identificado.');
        }
        const isMaster = this.isMasterActor(actor);
        const isAdmin = this.isAdminActor(actor);
        if (!isMaster && !isAdmin) {
            throw new ForbiddenException('Apenas MASTER ou ADMIN podem vincular usuários a tenants.');
        }

        const tenantId = (dto?.tenantId || '').trim();
        if (!tenantId) {
            throw new BadRequestException('Informe o Tenant de destino.');
        }

        let allowedSet: Set<string> | undefined;
        if (!isMaster) {
            const allowedIds = await this.getManageableTenantIds(actor);
            allowedSet = new Set(allowedIds);
            if (!allowedSet.has(tenantId)) {
                throw new ForbiddenException('Você não possui acesso ao tenant selecionado.');
            }
        }

        const resolvedTenants = await this.resolveTenantEntitiesByIds([tenantId]);
        if (resolvedTenants.length === 0) {
            throw new NotFoundException('Tenant não encontrado.');
        }
        const targetTenant = resolvedTenants[0];

        let targetUser: User | null = null;
        if (dto.userId?.trim()) {
            targetUser = await this.userRepo.findOne({
                where: { id: dto.userId.trim() },
                relations: { tenants: true, photo: true },
            });
        } else if (dto.emailOrUsername?.trim()) {
            const identifier = dto.emailOrUsername.trim();
            targetUser = await this.userRepo.findOne({
                where: [
                    { email: identifier.toLowerCase() },
                    { email: identifier },
                    { username: identifier },
                ],
                relations: { tenants: true, photo: true },
            });
        } else {
            throw new BadRequestException('Informe o ID, e-mail ou username do usuário.');
        }

        if (!targetUser) {
            throw new NotFoundException('Usuário não encontrado para vínculo ao tenant.');
        }

        if (!isMaster) {
            const targetRoles = this.getActorRoles(targetUser);
            if (targetRoles.includes('MASTER') || targetRoles.includes('GOODNESS')) {
                throw new ForbiddenException('Administradores de tenant não podem alterar usuários MASTER.');
            }
        }

        if (Array.isArray(dto.roles) && dto.roles.length > 0) {
            const cleanRoles = Array.from(
                new Set(dto.roles.map(r => (r || '').trim().toUpperCase()).filter(Boolean)),
            );
            if (!isMaster && (cleanRoles.includes('MASTER') || cleanRoles.includes('GOODNESS'))) {
                throw new ForbiddenException('Administradores de tenant não podem atribuir papéis MASTER ou GOODNESS.');
            }
            targetUser.roles = cleanRoles.includes('USER') ? cleanRoles : ['USER', ...cleanRoles];
        }

        targetUser.tenants = targetUser.tenants || [];
        if (!targetUser.tenants.some(t => t?.id === targetTenant.id)) {
            targetUser.tenants.push(targetTenant);
        }

        await this.userRepo.save(targetUser, { transaction: true });
        const updated = await this.findById(targetUser.id);
        return this.sanitizeManagedUser(updated || targetUser, isMaster ? undefined : allowedSet);
    }

    /**
     * Remove o vínculo de um usuário com um Tenant específico.
     */
    async removeUserFromTenant(
        dto: { userId: string; tenantId: string },
        actor: User,
    ): Promise<User> {
        if (!actor?.id) {
            throw new UnauthorizedException('Usuário autenticado não identificado.');
        }
        const isMaster = this.isMasterActor(actor);
        const isAdmin = this.isAdminActor(actor);
        if (!isMaster && !isAdmin) {
            throw new ForbiddenException('Apenas MASTER ou ADMIN podem desvincular usuários de tenants.');
        }

        const tenantId = (dto?.tenantId || '').trim();
        const userId = (dto?.userId || '').trim();
        if (!tenantId || !userId) {
            throw new BadRequestException('Informe o usuário e o tenant.');
        }

        let allowedSet: Set<string> | undefined;
        if (!isMaster) {
            const allowedIds = await this.getManageableTenantIds(actor);
            allowedSet = new Set(allowedIds);
            if (!allowedSet.has(tenantId)) {
                throw new ForbiddenException('Você não possui acesso ao tenant selecionado.');
            }
        }

        const targetUser = await this.userRepo.findOne({
            where: { id: userId },
            relations: { tenants: true, photo: true },
        });
        if (!targetUser) {
            throw new NotFoundException('Usuário não encontrado.');
        }

        if (!isMaster) {
            const targetRoles = this.getActorRoles(targetUser);
            if (targetRoles.includes('MASTER') || targetRoles.includes('GOODNESS')) {
                throw new ForbiddenException('Administradores de tenant não podem desvincular usuários MASTER.');
            }
        }

        targetUser.tenants = (targetUser.tenants || []).filter(t => t?.id !== tenantId);
        await this.userRepo.save(targetUser, { transaction: true });
        const updated = await this.findById(targetUser.id);
        return this.sanitizeManagedUser(updated || targetUser, isMaster ? undefined : allowedSet);
    }

    ocultaInformacaoSensivel(informacao: string): string {
        try {
            if (typeof informacao === 'string' && informacao.length > 4) {
                return informacao.substring(0, 2) + '↔' + informacao.substring(informacao.length - 2, informacao.length);
            } else if (typeof informacao === 'string' && informacao.length <= 4) {
                return informacao.substring(0, 1) + '↔';
            }
            return informacao;
        } catch (error) { console.trace(error); }
    }
}
