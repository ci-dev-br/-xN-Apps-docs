import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Conversation } from "./model/conversation.entity";
import { DirectMessage } from "./model/direct-message.entity";
import { ContactController } from "./controller/contacts.controller";
import { ContactService } from "./service/contact.service";
import { Contact } from "./model/contact.entity";
import { TenantModule } from "@ci/tenant";
import { CoreModule } from "@ci/core";
import { Chamada } from "./model/chamada.entity";
import { ChamadaService } from "./service/chamada.service";
import { ChamadaController } from "./controller/chamada.controller";
import { NotificacaoModule } from "@ci/notification";
export const Entities = [
    Conversation,
    DirectMessage,
    Contact,
    Chamada,
];
@Module({
    imports: [
        TypeOrmModule.forFeature([
            ...Entities,
        ]),
        TenantModule,
        CoreModule,
        NotificacaoModule,
    ],
    providers: [
        ContactService,
        ChamadaService,
    ],
    controllers: [
        ContactController,
        ChamadaController,
    ],
})
export class MessagerModule { }
export {
    Conversation,
    DirectMessage as Message,
    Contact,
}