import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Device } from "./models/device.entity";
import { Message } from "./models/message.entity";
import { PhoneNumber } from "./models/phone-number.entity";
import { DeviceController } from "./controller/device.controller";
import { DeviceService } from "./services/device.service";

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
    ],
    controllers: [
        DeviceController,
    ],
})
export class NotificacaoModule { }