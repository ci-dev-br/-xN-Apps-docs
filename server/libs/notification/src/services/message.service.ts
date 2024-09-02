import { Injectable } from "@nestjs/common";
import { Message } from "../models/message.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PhoneNumber } from "../notificacao.module";
export class SMSPaylod {
    message?: string;
    to?: string;
}
@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(PhoneNumber)
        private readonly phoneNumberRepository: Repository<PhoneNumber>,
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
    ) { }
    async sendSMS(payload: SMSPaylod) {
        const phone_number = await this.phoneNumberRepository.findOne({
            where: {}
        })
        const message = this.messageRepository.create({
            from: phone_number,
            textMessage: payload.message,
            to: payload.to,
            sent: false,
        })
        await this.messageRepository.save(message);
    }
}