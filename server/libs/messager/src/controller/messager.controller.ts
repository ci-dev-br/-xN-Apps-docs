import { Body, Req } from "@nestjs/common";
import { Request } from "express";
import { MessagePayload } from "../message.dto";

export class MessageController {
    constructor() { }
    async sendDirectMessage(
        @Req() request: Request,
        @Body() payload: MessagePayload,
    ) {
        throw new Error('Método não implementado.');
    }
}