import { Inject, Injectable } from "@nestjs/common";
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
    async createInvite(email: string, invitedByUserId: string) {
        const invite = this.repository.create();
        invite.email = email;
        invite.invited = false;
        invite.accepted = false;
        invite.createdBy = { user: { id: invitedByUserId } };
        return await this.repository.save(invite);
    }
    async sendInvitation(registro: {
        email: string,
        friendlyName: string,
        mensagem: string,
    },
        invitedByUser?: User,
    ) {
        return await new Promise<void>((res, rej) => {
            if (!!registro.email) {
                this.mailer.requestSendMessageToMail(
                    conviteToMessagePayload({
                        ...registro,
                        invite: 'INVITE-' + createHash('sha256').update(`${Date.now()}${registro.email}`).digest('hex').toString(),
                    })
                );
                res();
            }
        });
    }
}