import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Device } from "./models/device.entity";
import { Message } from "./models/message.entity";
import { PhoneNumber } from "./models/phone-number.entity";

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
    ]
})
export class NotificacaoModule { }