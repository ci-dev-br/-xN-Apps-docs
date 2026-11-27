import { BadRequestException, ForbiddenException, Injectable, NotFoundException, Optional } from "@nestjs/common";
import { Repository } from "typeorm";
import { Invite } from "../models/invite.entity";
import { Register } from "../models/register.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../models/user.entity";
import { conviteToMessagePayload } from "../functions/convite-to-message-payload";
import { MailService } from "@ci/notification/services/mail.service";
import { createHash } from "crypto";
import { TenantService } from "@ci/tenant/service/tenant.service";

/**
 * Service para gerenciamento de convites.
 * Responsável por criar, validar e gerenciar convites no sistema.
 */
@Injectable()
export class InviteService {
    constructor(
        private readonly mailer: MailService,
        @InjectRepository(Invite)
        private readonly repository?: Repository<Invite>,
        @Optional()
        @InjectRepository(Register)
        private readonly registerRepository?: Repository<Register>,
        @Optional()
        private readonly tenantService?: TenantService,
    ) { }

    private generateHash(email: string, refDate?: Date): string {
        const ts = refDate ? refDate.toISOString() : new Date().toISOString();
        return 'INVITE-' + createHash('sha256')
            .update(`${ts}:${(email || '').trim().toLowerCase()}:${Math.random()}`)
            .digest('hex');
    }

    private async normalizeInviteRolesAndTenants(
        requestedRoles?: string[],
        requestedTenantIds?: string[],
        invitedByUser?: User,
    ): Promise<{ roles: string[]; tenantIds?: string[] }> {
        const actorRoles = Array.isArray(invitedByUser?.roles) ? invitedByUser.roles : [];
        const isMaster = actorRoles.includes('MASTER') || actorRoles.includes('GOODNESS');
        const isAdmin = actorRoles.includes('ADMIN');

        let cleanRoles = Array.isArray(requestedRoles)
            ? requestedRoles.map(r => (r || '').trim().toUpperCase()).filter(Boolean)
            : [];

        if (!isMaster) {
            if (cleanRoles.includes('MASTER') || cleanRoles.includes('GOODNESS')) {
                throw new ForbiddenException('Somente usuários MASTER podem convidar usuários com papel MASTER ou GOODNESS.');
            }
            if (!isAdmin && cleanRoles.some(r => r !== 'USER')) {
                throw new ForbiddenException('Apenas administradores podem atribuir papéis elevados no convite.');
            }
        }
        if (cleanRoles.length === 0) {
            cleanRoles = ['USER'];
        } else if (!cleanRoles.includes('USER')) {
            cleanRoles = ['USER', ...cleanRoles];
        }

        let cleanTenantIds = Array.isArray(requestedTenantIds)
            ? Array.from(new Set(requestedTenantIds.map(id => (id || '').trim()).filter(Boolean)))
            : undefined;

        if (cleanTenantIds && cleanTenantIds.length > 0 && !isMaster) {
            if (!invitedByUser?.id) {
                throw new ForbiddenException('Usuário autenticado necessário para vincular tenants ao convite.');
            }
            const available = this.tenantService
                ? await this.tenantService.listarTenantsDisponiveis(invitedByUser)
                : (invitedByUser.tenants || []).map(t => ({
                    ...t,
                    permissionsSummary: { canVisualizar: true, canVer: true, canEditar: true, canCompartilhar: isAdmin },
                }));
            const allowedIds = new Set(
                (available || [])
                    .filter(t => t?.id && (isAdmin || t.permissionsSummary?.canCompartilhar || t.permissionsSummary?.canEditar))
                    .map(t => t.id as string),
            );
            const unauthorized = cleanTenantIds.find(id => !allowedIds.has(id));
            if (unauthorized) {
                throw new ForbiddenException('Você não possui permissão para convidar usuários para um ou mais tenants selecionados.');
            }
        }

        return {
            roles: cleanRoles,
            tenantIds: cleanTenantIds && cleanTenantIds.length > 0 ? cleanTenantIds : undefined,
        };
    }

    /**
     * # Cria um novo convite no sistema.
     */
    async createInvite(
        email: string,
        invitedByUserId?: string,
        friendlyName?: string,
        mensagem?: string,
        phoneSMS?: string,
        roles?: string[],
        chaveAcesso?: string,
        tenantIds?: string[],
    ) {
        const normalizedEmail = (email || '').trim().toLowerCase();
        if (!normalizedEmail) {
            throw new BadRequestException('O e-mail do convidado é obrigatório.');
        }

        const now = new Date();
        const invite = this.repository.create();
        invite.email = normalizedEmail;
        invite.friendlyName = friendlyName?.trim() || normalizedEmail.split('@')[0];
        invite.mensagem = mensagem?.trim() || undefined;
        invite.phoneSMS = phoneSMS;
        invite.invited = false;
        invite.accepted = false;
        invite.roles = Array.isArray(roles) && roles.length > 0 ? roles : ['USER'];
        invite.tenantIds = Array.isArray(tenantIds) && tenantIds.length > 0 ? tenantIds : undefined;
        invite.inviteHash = this.generateHash(normalizedEmail, now);

        if (chaveAcesso) {
            invite.createdBy = { id: chaveAcesso } as any;
        }

        return await this.repository.save(invite);
    }

    /**
     * # Envia um convite para um usuário.
     * Cria ou atualiza a entidade Invite com seu invite-hash e envia o e-mail contendo o link de registro.
     */
    async sendInvitation(
        registro: {
            email: string;
            friendlyName?: string;
            mensagem?: string;
            phoneSMS?: string;
            roles?: string[];
            tenantIds?: string[];
        },
        invitedByUser?: User,
        originUrl?: string,
        chaveAcesso?: string,
    ) {
        const normalized = await this.normalizeInviteRolesAndTenants(
            registro.roles,
            registro.tenantIds,
            invitedByUser,
        );
        const invite = await this.createInvite(
            registro.email,
            invitedByUser?.id,
            registro.friendlyName,
            registro.mensagem,
            registro.phoneSMS,
            normalized.roles,
            chaveAcesso,
            normalized.tenantIds,
        );

        const inviteHash = invite.inviteHash || this.generateHash(invite.email, invite.createdAt);
        if (!invite.inviteHash) {
            invite.inviteHash = inviteHash;
        }

        if (invite.email) {
            try {
                await this.mailer.requestSendMessageToMail(
                    conviteToMessagePayload({
                        email: invite.email,
                        friendlyName: invite.friendlyName || invite.email,
                        mensagem: invite.mensagem || '',
                        invite: inviteHash,
                        originUrl,
                    })
                );
                invite.invited = true;
            } catch (mailErr: any) {
                console.warn('[InviteService] Aviso no disparo de e-mail de convite:', mailErr?.message || mailErr);
                invite.invited = true;
            }
            await this.repository.save(invite);
        }

        const baseUrl = (originUrl || 'https://apps.ci.dev.br').replace(/\/+$/, '');
        return {
            ...invite,
            inviteHash,
            convite: inviteHash,
            registrationLink: `${baseUrl}/registrar/${inviteHash}`,
        };
    }

    /**
     * Sincroniza (cadastra/atualiza) a entidade Invite diretamente e envia o invite-hash por e-mail.
     */
    async sync(convite: Partial<Invite>, req?: any) {
        if (!convite) {
            throw new BadRequestException('Dados do convite não informados.');
        }
        const originUrl = req?.headers?.origin || (req?.headers?.referer ? new URL(req.headers.referer).origin : undefined);
        const chaveAcesso = req?.chaveAcesso;

        if (!convite.internalId) {
            return await this.sendInvitation(
                {
                    email: convite.email!,
                    friendlyName: convite.friendlyName,
                    mensagem: convite.mensagem,
                    phoneSMS: convite.phoneSMS,
                    roles: convite.roles,
                },
                req?.user,
                originUrl,
                chaveAcesso,
            );
        }

        let existing = await this.repository.findOne({ where: { internalId: convite.internalId } });
        if (!existing) {
            return await this.sendInvitation(
                {
                    email: convite.email!,
                    friendlyName: convite.friendlyName,
                    mensagem: convite.mensagem,
                    phoneSMS: convite.phoneSMS,
                    roles: convite.roles,
                },
                req?.user,
                originUrl,
                chaveAcesso,
            );
        }

        Object.assign(existing, {
            email: convite.email ?? existing.email,
            friendlyName: convite.friendlyName ?? existing.friendlyName,
            mensagem: convite.mensagem ?? existing.mensagem,
            phoneSMS: convite.phoneSMS ?? existing.phoneSMS,
            phoneWhatsApp: convite.phoneWhatsApp ?? existing.phoneWhatsApp,
            roles: convite.roles && convite.roles.length > 0 ? convite.roles : (existing.roles || ['USER']),
        });
        if (!existing.inviteHash && existing.email) {
            existing.inviteHash = this.generateHash(existing.email, existing.createdAt);
        }

        const saved = await this.repository.save(existing);
        if (!saved.invited && saved.email) {
            try {
                await this.mailer.requestSendMessageToMail(
                    conviteToMessagePayload({
                        email: saved.email,
                        friendlyName: saved.friendlyName || saved.email,
                        mensagem: saved.mensagem || '',
                        invite: saved.inviteHash!,
                        originUrl,
                    })
                );
                saved.invited = true;
                await this.repository.save(saved);
            } catch { }
        }

        const baseUrl = (originUrl || 'https://apps.ci.dev.br').replace(/\/+$/, '');
        return {
            ...saved,
            convite: saved.inviteHash,
            registrationLink: `${baseUrl}/registrar/${saved.inviteHash}`,
        };
    }

    /**
     * # Valida o convite e retorna os dados do convite a partir do invite-hash.
     */
    async getInvite(invite: string) {
        let cleanCode = (invite || '').trim();
        try {
            cleanCode = decodeURIComponent(cleanCode).trim();
        } catch {
            // mantém valor original se não for URI-encoded
        }
        cleanCode = cleanCode.replace(/^\/+|\/+$/g, '').trim();

        if (!cleanCode) {
            throw new BadRequestException('Código de convite (invite-hash) não informado.');
        }

        const withPrefix = cleanCode.toUpperCase().startsWith('INVITE-')
            ? `INVITE-${cleanCode.slice(7)}`
            : `INVITE-${cleanCode}`;
        const withoutPrefix = cleanCode.replace(/^INVITE-/i, '');
        const withoutPrefixLower = withoutPrefix.toLowerCase();
        const withPrefixLower = `INVITE-${withoutPrefixLower}`;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanCode);

        const whereConditions: any[] = [
            { inviteHash: cleanCode },
            { inviteHash: withPrefix },
            { inviteHash: withoutPrefix },
            { inviteHash: withPrefixLower },
            { inviteHash: withoutPrefixLower },
        ];
        if (isUuid) {
            whereConditions.push({ internalId: cleanCode });
        }

        let found = await this.repository.findOne({
            where: whereConditions,
            order: { createdAt: 'DESC' },
        });

        // Fallback de compatibilidade caso o convite antigo não tenha inviteHash persistido em coluna
        if (!found) {
            const candidates = await this.repository.find({
                order: { createdAt: 'DESC' },
                take: 200,
            });
            for (const row of candidates) {
                const rawLegacy = createHash('sha256')
                    .update(`${row.createdAt}${row.email || ''}`)
                    .digest('hex')
                    .toLowerCase();
                const isoLegacy = row.createdAt instanceof Date
                    ? createHash('sha256').update(`${row.createdAt.toISOString()}${row.email || ''}`).digest('hex').toLowerCase()
                    : '';
                const subIdHash = row.internalId
                    ? createHash('sha256').update(String(row.internalId).substring(8)).digest('hex').toLowerCase()
                    : '';
                const fullIdEmailHash = row.internalId
                    ? createHash('sha256').update(`${row.internalId}${row.email || ''}`).digest('hex').toLowerCase()
                    : '';
                const strippedStored = (row.inviteHash || '').replace(/^INVITE-/i, '').toLowerCase();

                if (
                    [rawLegacy, isoLegacy, subIdHash, fullIdEmailHash, strippedStored].includes(withoutPrefixLower) ||
                    `INVITE-${rawLegacy}` === withPrefixLower
                ) {
                    row.inviteHash = row.inviteHash || cleanCode;
                    found = await this.repository.save(row);
                    break;
                }
            }
        }

        // Fallback para convites/registros gerados em authentication.register (ex.: ?invite=<sha256(internalId.substring(8))>)
        if (!found && this.registerRepository) {
            try {
                const regCandidates = await this.registerRepository.find({
                    order: { createdAt: 'DESC' },
                    take: 500,
                });
                for (const reg of regCandidates) {
                    const idStr = String(reg.internalId || '');
                    if (!idStr) continue;
                    const hSub = createHash('sha256').update(idStr.substring(8)).digest('hex').toLowerCase();
                    const hMail = createHash('sha256').update(`${idStr}${reg.mail || ''}`).digest('hex').toLowerCase();
                    const hFull = createHash('sha256').update(idStr).digest('hex').toLowerCase();

                    if (
                        idStr.toLowerCase() === cleanCode.toLowerCase() ||
                        [hSub, hMail, hFull].includes(withoutPrefixLower)
                    ) {
                        const normalizedMail = reg.mail ? reg.mail.trim().toLowerCase() : undefined;
                        const syncedInvite = this.repository.create({
                            email: normalizedMail,
                            friendlyName: normalizedMail ? normalizedMail.split('@')[0] : undefined,
                            phoneSMS: reg.phone || undefined,
                            inviteHash: cleanCode,
                            roles: ['USER'],
                            invited: true,
                            accepted: Boolean(reg.deletedAt),
                        });
                        found = await this.repository.save(syncedInvite);
                        break;
                    }
                }
            } catch (regErr) {
                console.warn('[InviteService] Aviso ao verificar authentication.register:', regErr);
            }
        }

        // Se ainda não encontrou mas o hash possui formato SHA-256 válido (64 hex chars), materializa o convite com ROLE 'USER'
        if (!found && /^[0-9a-f]{64}$/i.test(withoutPrefixLower)) {
            const autoInvite = this.repository.create({
                inviteHash: cleanCode,
                roles: ['USER'],
                invited: true,
                accepted: false,
            });
            found = await this.repository.save(autoInvite);
        }

        if (!found) {
            throw new NotFoundException('Convite não encontrado ou código invite-hash inválido.');
        }

        return {
            internalId: found.internalId,
            email: found.email,
            friendlyName: found.friendlyName,
            mensagem: found.mensagem,
            inviteHash: found.inviteHash || cleanCode,
            convite: found.inviteHash || cleanCode,
            roles: found.roles && found.roles.length > 0 ? found.roles : ['USER'],
            tenantIds: Array.isArray(found.tenantIds) ? found.tenantIds : undefined,
            invited: Boolean(found.invited),
            accepted: Boolean(found.accepted),
            createdAt: found.createdAt,
        };
    }

    /**
     * Marca um convite como aceito após a conclusão do cadastro do convidado.
     */
    async markInviteAccepted(inviteHashOrEmail?: string, email?: string) {
        try {
            let found: Invite | null = null;
            const normalizedEmail = email ? email.trim().toLowerCase() : undefined;
            if (inviteHashOrEmail) {
                const cleanCode = inviteHashOrEmail.trim();
                const withPrefix = cleanCode.toUpperCase().startsWith('INVITE-') ? cleanCode : `INVITE-${cleanCode}`;
                const withoutPrefix = cleanCode.replace(/^INVITE-/i, '');
                found = await this.repository.findOne({
                    where: [
                        { inviteHash: cleanCode },
                        { inviteHash: withPrefix },
                        { inviteHash: withoutPrefix },
                    ],
                    order: { createdAt: 'DESC' },
                });

                if (this.registerRepository && normalizedEmail) {
                    try {
                        const regCandidates = await this.registerRepository.find({
                            order: { createdAt: 'DESC' },
                            take: 500,
                        });
                        for (const reg of regCandidates) {
                            const idStr = String(reg.internalId || '');
                            if (!idStr) continue;
                            const hSub = createHash('sha256').update(idStr.substring(8)).digest('hex');
                            const hMail = createHash('sha256').update(`${idStr}${reg.mail || ''}`).digest('hex');
                            if (idStr === cleanCode || [hSub, hMail].includes(withoutPrefix)) {
                                if (!reg.mail) {
                                    reg.mail = normalizedEmail;
                                    await this.registerRepository.save(reg);
                                }
                                break;
                            }
                        }
                    } catch { }
                }
            }
            if (!found && normalizedEmail) {
                found = await this.repository.findOne({
                    where: { email: normalizedEmail },
                    order: { createdAt: 'DESC' },
                });
            }
            if (found) {
                found.accepted = true;
                found.invited = true;
                if (normalizedEmail && !found.email) {
                    found.email = normalizedEmail;
                    if (!found.friendlyName) {
                        found.friendlyName = normalizedEmail.split('@')[0];
                    }
                }
                await this.repository.save(found);
            }
            return found;
        } catch (err) {
            console.warn('[InviteService] Falha ao marcar convite como aceito:', err);
            return null;
        }
    }

    async findAll() {
        return await this.repository.find({
            order: { createdAt: 'DESC' },
            take: 100,
        });
    }
}