import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Register } from "../models/register.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { MailService } from "@ci/notification/services/mail.service";
import { readFileSync } from "fs";
import { join } from "path";
import { templateHtml } from "@ci/core/template/load-template.fn";
const registerToMessagePayload = (register: Register) => {
    return {
        template_html: templateHtml('register--initial-confirmation-template', {
            logo_base64: '',
            ano: (new Date()).getFullYear(),
            footer_assinatura: 'ci.dev.br',
            footer_message: 'Apps, seus aplicativos',
        }),
        message_text: null,
        to: register.mail,
        person: null,
        from: null,
        from_person: null,
        need_feedback: null,
    }
}
@Injectable()
export class RegisterService {
    constructor(
        @InjectRepository(Register)
        private readonly repo: Repository<Register>,
        private readonly mails: MailService,
    ) { }
    async register(register: Register) {
        const register_before_persist = this.repo.create(register);
        const registry_on_requested = await this.repo.save(register_before_persist);
        try {
            this.mails.requestSendMessageToMail(
                registerToMessagePayload(registry_on_requested)
            );
        } catch (error) {

        }
    }
}