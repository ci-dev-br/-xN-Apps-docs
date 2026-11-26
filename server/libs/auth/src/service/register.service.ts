import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Register } from "../models/register.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { MailService } from "@ci/notification/services/mail.service";
import { templateHtml } from "@ci/core/template/load-template.fn";
import { createHash, Hash } from "node:crypto";
export const registerToMessagePayload = (register: Register, originUrl?: string, customHash?: string) => {
    try {
        const baseUrl = (originUrl || 'https://apps.ci.dev.br').replace(/\/+$/, '');
        const register_id = customHash || createHash('sha256').update(
            register.internalId ? register.internalId.substring(8) : `${register.internalId}${register.mail}`
        ).digest('hex').toString();
        const actUrl = `${baseUrl}/registrar/${register_id}`;
        const reportUrl = `${baseUrl}/suporte/novo?assunto=Problema%20no%20registro%20de%20conta%20de%20e-mail%20${register_id}&mensagem=Descreva%20o%20problema%20encontrado...`;
        return {
            template_html: templateHtml('register--initial-confirmation-template', {
                logo_base64: '',
                act_url: actUrl,
                new_report_link: reportUrl,
                unsubscribe_link: `${baseUrl}/?unsubscribe=${encodeURIComponent(register.mail || '')}`,
                ano: (new Date()).getFullYear(),
                footer_assinatura: 'ci.dev.br',
                footer_message: 'Apps, seus aplicativos',
            }),
            message_text: `Confirme seu cadastro acessando: ${actUrl}`,
            to: register.mail,
            person: null,
            from: null,
            from_person: null,
            need_feedback: null,
            new_report_link: reportUrl,
            act_url: actUrl,
        }
    } catch (error) { console.trace(error); }
}
@Injectable()
export class RegisterService {
    constructor(
        @InjectRepository(Register)
        private readonly repo: Repository<Register>,
        private readonly mails: MailService,
    ) { }
    async register(register: Register) {
        try {
            const register_before_persist = this.repo.create(register);
            const registry_on_requested = await this.repo.save(register_before_persist);
            return registry_on_requested;
        } catch (error) { console.trace(error); }
    }
}