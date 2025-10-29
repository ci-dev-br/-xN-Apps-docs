import { Body, Controller, Req, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DirectMessage } from "../messager.module";
const CONTROLLER_NAME = 'DirectMessage';
/**
 * Direct message Controller
 * 
 * Gerenciador de Envio de Mensagem Direta
 * 
 */
@ApiTags(CONTROLLER_NAME)
@Controller(CONTROLLER_NAME)
export class DirectMessageController {
    async recive(
        @Req() request: Request,
        @Res() response: Response,
        @Body() directMessage: DirectMessage) {

    }
}