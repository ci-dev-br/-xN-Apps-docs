import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { Invite } from "../models/invite.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../models/user.entity";
import { conviteToMessagePayload } from "../functions/convite-to-message-payload";
import { MailService } from "@ci/notification/services/mail.service";
import { createHash } from "crypto";

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
    ) { }

    private generateHash(email: string, refDate?: Date): string {
        const ts = refDate ? refDate.toISOString() : new Date().toISOString();
        return 'INVITE-' + createHash('sha256')
            .update(`${ts}:${(email || '').trim().toLowerCase()}:${Math.random()}`)
            .digest('hex');
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
        },
        invitedByUser?: User,
        originUrl?: string,
        chaveAcesso?: string,
    ) {
        const invite = await this.createInvite(
            registro.email,
            invitedByUser?.id,
            registro.friendlyName,
            registro.mensagem,
            registro.phoneSMS,
            registro.roles,
            chaveAcesso,
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
    async sync(data: Partial<Invite>, req?: any) {
        if (!data) {
            throw new BadRequestException('Dados do convite não informados.');
        }
        const originUrl = req?.headers?.origin || (req?.headers?.referer ? new URL(req.headers.referer).origin : undefined);
        const chaveAcesso = req?.chaveAcesso;

        if (!data.internalId) {
            return await this.sendInvitation(
                {
                    email: data.email!,
                    friendlyName: data.friendlyName,
                    mensagem: data.mensagem,
                    phoneSMS: data.phoneSMS,
                    roles: data.roles,
                },
                req?.user,
                originUrl,
                chaveAcesso,
            );
        }

        let existing = await this.repository.findOne({ where: { internalId: data.internalId } });
        if (!existing) {
            return await this.sendInvitation(
                {
                    email: data.email!,
                    friendlyName: data.friendlyName,
                    mensagem: data.mensagem,
                    phoneSMS: data.phoneSMS,
                    roles: data.roles,
                },
                req?.user,
                originUrl,
                chaveAcesso,
            );
        }

        Object.assign(existing, {
            email: data.email ?? existing.email,
            friendlyName: data.friendlyName ?? existing.friendlyName,
            mensagem: data.mensagem ?? existing.mensagem,
            phoneSMS: data.phoneSMS ?? existing.phoneSMS,
            phoneWhatsApp: data.phoneWhatsApp ?? existing.phoneWhatsApp,
            roles: data.roles && data.roles.length > 0 ? data.roles : (existing.roles || ['USER']),
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
        const cleanCode = (invite || '').trim();
        if (!cleanCode) {
            throw new BadRequestException('Código de convite (invite-hash) não informado.');
        }

        const withPrefix = cleanCode.toUpperCase().startsWith('INVITE-')
            ? cleanCode
            : `INVITE-${cleanCode}`;
        const withoutPrefix = cleanCode.replace(/^INVITE-/i, '');
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanCode);

        const whereConditions: any[] = [
            { inviteHash: cleanCode },
            { inviteHash: withPrefix },
            { inviteHash: withoutPrefix },
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
                const legacyHash = 'INVITE-' + createHash('sha256')
                    .update(`${row.createdAt}${row.email}`)
                    .digest('hex');
                if (legacyHash === cleanCode || legacyHash === withPrefix) {
                    row.inviteHash = legacyHash;
                    found = await this.repository.save(row);
                    break;
                }
            }
        }

        if (!found) {
            throw new NotFoundException('Convite não encontrado ou código invite-hash inválido.');
        }

        return {
            internalId: found.internalId,
            email: found.email,
            friendlyName: found.friendlyName,
            mensagem: found.mensagem,
            inviteHash: found.inviteHash,
            convite: found.inviteHash,
            roles: found.roles && found.roles.length > 0 ? found.roles : ['USER'],
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
            if (inviteHashOrEmail) {
                const cleanCode = inviteHashOrEmail.trim();
                const withPrefix = cleanCode.toUpperCase().startsWith('INVITE-') ? cleanCode : `INVITE-${cleanCode}`;
                found = await this.repository.findOne({
                    where: [
                        { inviteHash: cleanCode },
                        { inviteHash: withPrefix },
                    ],
                    order: { createdAt: 'DESC' },
                });
            }
            if (!found && email) {
                found = await this.repository.findOne({
                    where: { email: email.trim().toLowerCase() },
                    order: { createdAt: 'DESC' },
                });
            }
            if (found) {
                found.accepted = true;
                found.invited = true;
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