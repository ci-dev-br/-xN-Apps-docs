    import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Device } from "./models/device.entity";
import { Message } from "./models/message.entity";
import { PhoneNumber } from "./models/phone-number.entity";
import { DeviceController } from "./controller/device.controller";
import { DeviceService } from "./services/device.service";
import { MessageController } from "./controller/message.controller";
import { MessageService } from "./services/message.service";
import { NotificationService } from "./services/notification.service";
import { MailService } from "./services/mail.service";
import { CoreModule } from "@ci/core";
export const Entities = [
    Device,
    Message,
    PhoneNumber,
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
    ],
    exports: [
        MessageService,
        MailService,
    ]
})
export class NotificacaoModule { }
export {
    Device,
    Message,
    PhoneNumber,
}