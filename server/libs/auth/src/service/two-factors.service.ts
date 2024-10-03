import { Injectable } from "@nestjs/common";
import { User } from "../models/user.entity";
import { MessageService } from "@ci/notification/services/message.service";

@Injectable()
export class TwoFactorAuthenticationService {
    constructor(
        private readonly messageService: MessageService,
    ) { }
    async requestTwoFactorAuthentication(user: User) {
        const authorization_code = (Math.random() * 0xFFFFFFFFFFFFFF).toString(36).toUpperCase().substring(0, 6);
        
        await this.messageService.sendSMS({
            message: `Olá ${user.fullName || ''}, seu código de autorização é ${authorization_code}`,
        })

        return null;
    }
}