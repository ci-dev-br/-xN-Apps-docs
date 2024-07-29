import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Device } from "./models/device.entity";
import { Message } from "./models/message.entity";
import { PhoneNumber } from "./models/phone-number.entity";
import { DeviceController } from "./controller/device.controller";
import { DeviceService } from "./services/device.service";
import { MessageController } from "./controller/message.controller";
export const Entities = [
    Device,
    Message,
    PhoneNumber,
];
@Module({
    imports: [
        TypeOrmModule.forFeature([
            ...Entities,
        ])
    ],
    providers: [
        DeviceService,
        MessageController,
    ],
    controllers: [
        DeviceController,
        MessageController,
    ],
})
export class NotificacaoModule { }
export {
    Device,
    Message,
    PhoneNumber,
}