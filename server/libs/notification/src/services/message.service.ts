import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { Message } from "../models/message.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PhoneNumber } from "../notificacao.module";
import { BusService } from "@ci/core/events/bus.service";
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
        @Inject(forwardRef(() => BusService))
        private readonly bus: BusService,
    ) {
        console.log('[Message Service]');
    }
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
        setTimeout(() => {
            this.devileryMessages()
        }, 100);
    }
    public async devileryMessages() {
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
    }
    async markAsDelivered(id: string) {
        let a = (await this.messageRepository.findOneBy({
            id
        }));
        a.sent = true
        await this.messageRepository.save(a);
    }
}