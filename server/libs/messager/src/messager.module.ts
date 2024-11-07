import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Conversation } from "./model/conversation.entity";
import { DirectMessage } from "./model/direct-message.entity";
import { ContactController } from "./controller/contacts.controller";
import { ContactService } from "./service/contact.service";
import { Contact } from "./model/contact.entity";
import { TenantModule } from "@ci/tenant";
import { CoreModule } from "@ci/core";

export const Entities = [
    Conversation,
    DirectMessage,
    Contact,
];

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ...Entities,
        ]),
        TenantModule,
        CoreModule,
    ],
    providers: [
        ContactService,
    ],
    controllers: [
        ContactController,
    ],
})
export class MessagerModule { }
export {
    Conversation,
    DirectMessage as Message,
    Contact,
}