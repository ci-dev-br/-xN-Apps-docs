import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Conversation } from "./model/conversation.entity";
import { Message } from "./model/message.entity";

export const Entities = [
    Conversation,
    Message,
];

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ...Entities,
        ])
    ],
    providers: [
    ],
    controllers: [
    ],
})
export class MessagerModule { }