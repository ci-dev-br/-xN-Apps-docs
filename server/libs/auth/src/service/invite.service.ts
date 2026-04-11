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
    /**
     * # Cria um novo convite no sistema.
     * Descrição:
     * Este método cria um novo convite no sistema, associando-o a um endereço de e-mail e ao ID do usuário que o convidou. O convite é inicialmente marcado como não enviado (`invited: false`) e não aceito (`accepted: false`).
     * 
     * @param email 
     * @param invitedByUserId 
     * @returns 
     */
    async createInvite(email: string, invitedByUserId: string) {
        const invite = this.repository.create();
        invite.email = email;
        invite.invited = false;
        invite.accepted = false;
        invite.createdBy = { user: { id: invitedByUserId } };
        return await this.repository.save(invite);
    }
    /**
     *  # Envia um convite para um usuário.
     * Descrição:
     * Este método cria um convite no sistema e, em seguida, envia um e-mail para o endereço de e-mail fornecido. O e-mail contém um link de convite que o usuário pode usar para se registrar.
     * 
     * @param registro 
     * @param invitedByUser 
     * @returns 
     */
    async sendInvitation(registro: {
        email: string,
        friendlyName: string,
        mensagem: string,
    },
        invitedByUser?: User,
    ) {
        let invite = await this.createInvite(registro.email, invitedByUser.id);
        return await new Promise<void>((res, rej) => {
            if (!!registro.email) {
                this.mailer.requestSendMessageToMail(
                    conviteToMessagePayload({
                        ...registro,
                        invite: 'INVITE-' + createHash('sha256').update(`${invite.createdAt}${invite.email}`).digest('hex').toString(),
                    })
                );
                res();
            }
        });
    }
    /**
     * # Valida o convite e retorna os dados do convite.
     * 
     * Descrição:
     * Este método recebe um código de convite, que é um hash SHA256 gerado a partir da data de criação e do e-mail do convite. Ele busca no banco de dados por um convite que corresponda a este hash. Se encontrado, retorna o objeto `Invite`; caso contrário, lança um erro.
     * 
     * @param invite 
     * @returns 
     */
    async getInvite(invite: string) {
        return await new Promise<Invite>(async (result, reject) => {
            try {
                result(await this.repository.createQueryBuilder('invite')
                    .where('sha2(concat(invite.created_at,invite.email)),256)=sha2(:invite_code,256)', { invite_code: invite }).getOneOrFail());
            } catch (error) {
                reject(error);
            }
        });
    }
}