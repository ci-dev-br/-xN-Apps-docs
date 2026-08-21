import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { Message } from "../models/message.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PhoneNumber } from "../notificacao.module";
import { BusService } from "@ci/core/events/bus.service";
export class SendMessagePayload {
    message?: string;
    to?: string;
    templateHtml?: string;
}
@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(PhoneNumber)
        private readonly phoneNumberRepository: Repository<PhoneNumber>,
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        @Inject(forwardRef(() => BusService))
        private readonly bus: BusService,
    ) {
        // console.log('[Message Service]');
    }
    async sendSMS(payload: SendMessagePayload) {
        try {
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
            setTimeout(() => {
                this.devileryMessages()
            }, 100);
        } catch (error) {
            console.trace(error);
        }
    }
    async sendMail(payload: SendMessagePayload) {
        try {

            const message = this.messageRepository.create({
                textMessage: payload.message,
                to: payload.to,
                htmlMessage: payload.templateHtml,
                type: 'mail',
                sent: false,
            });
            this.messageRepository.save(message);
            setTimeout(() => {
                try {
                    this.devileryMessages()
                } catch (error) { console.trace(error); }
            }, Math.floor(5000 * Math.random()));
        } catch (error) { console.trace(error); }
    }
    public async devileryMessages() {
        try {

            let phones = await this.phoneNumberRepository.find({
                where: {
                    device: {
                        // mac
                    }
                }
            })
            let messages = await this.messageRepository.find({
                where: {
                    sent: false,
                }
            });
            let msg;
            if (!!messages)
                messages.forEach(message => {
                    this.bus.sendMessgeToDevice(null, 'events', JSON.stringify(msg = {
                        type: 'dispatch',
                        origin: 'any',
                        deliveryId: message.id,
                        authorizationDelivery: 'any',
                        message: {
                            from: message.from,
                            to: message.to,
                            content: message.textMessage,
                        }
                    }));
                });
        } catch (error) {
            console.trace(error);
        }
    }
    async markAsDelivered(id: string) {
        try {
            let message = (await this.messageRepository.findOneBy({
                id
            }));
            message.sent = true
            await this.messageRepository.save(message);
        } catch (error) {
            console.trace(error);
        }
    }
}