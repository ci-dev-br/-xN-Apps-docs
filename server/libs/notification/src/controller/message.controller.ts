import { Body, Controller, Post } from "@nestjs/common";
import { ApiProperty, ApiTags } from "@nestjs/swagger";
export class FiendClientByPayload {
    @ApiProperty({ description: 'Text of search Clients Disposes to send Message' })
    search?: string;
    @ApiProperty({ description: 'Text of search Clients Disposes to send Message' })
    username?: string;
    @ApiProperty({ description: 'Text of search Clients Disposes to send Message' })
    documentId?: string;
    @ApiProperty({ description: 'Text of search Clients Disposes to send Message' })
    cellPhone?: string;
}
export class SendMessagePayload {
    /***
     * 
     *  Client ID is a instantiality indentification of client obtained from FindClientBy
     * 
     * 
     */
    clientId?: string;
    /***
     * Text Message 
     */
    message?: string;
}
@ApiTags('Message')
@Controller('Message')
export class MessageController {
    constructor() { }
    @Post()
    async SendMessage(@Body() payload?: SendMessagePayload) { }
    @Post()
    async FindClientBy(@Body() payload?: FiendClientByPayload) {
    }
}