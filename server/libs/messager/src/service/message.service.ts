import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { DirectMessage } from "../model/direct-message.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Conversation } from "../messager.module";
/**
 *  Servico para envio de mensagens para conversas
 */
@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(DirectMessage)
        private readonly repo: Repository<DirectMessage>
    ) { }
    async SendMessage(payload: { message: string, conversa: Conversation }) {
    }
}