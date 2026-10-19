import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Device } from "./models/device.entity";
import { Message } from "./models/message.entity";
import { PhoneNumber } from "./models/phone-number.entity";
import { NotificacaoInterna } from "./models/notificacao-interna.entity";
import { WebPushSubscription } from "./models/web-push-subscription.entity";
import { DeviceController } from "./controller/device.controller";
import { DeviceService } from "./services/device.service";
import { MessageController } from "./controller/message.controller";
import { MessageService } from "./services/message.service";
import { NotificationService } from "./services/notification.service";
import { NotificationController } from "./controller/notification.controller";
import { MailService } from "./services/mail.service";
import { CoreModule } from "@ci/core";

export const Entities = [
    Device,
    Message,
    PhoneNumber,
    NotificacaoInterna,
    WebPushSubscription,
];

@Module({
    imports: [
        CoreModule,
        TypeOrmModule.forFeature([
            ...Entities,
        ])
    ],
    providers: [
        DeviceService,
        MessageService,
        NotificationService,
        MailService,
    ],
    controllers: [
        DeviceController,
        MessageController,
        NotificationController,
    ],
    exports: [
        MessageService,
        MailService,
        NotificationService,
    ]
})
export class NotificacaoModule { }
export {
    Device,
    Message,
    PhoneNumber,
    NotificacaoInterna,
    WebPushSubscription,
    NotificationService,
}