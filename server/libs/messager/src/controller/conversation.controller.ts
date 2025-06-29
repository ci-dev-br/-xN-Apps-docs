import { Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ConversationService } from "../service/conversation.service";
import { Conversation } from "../model/conversation.entity";
const CONTROLLER_NAME = 'Conversation';
@ApiTags(CONTROLLER_NAME)
@Controller(CONTROLLER_NAME)
export class ConversationController {
    constructor(
        private readonly service: ConversationService,
    ) { }
    @ApiResponse({
        type: Conversation,
        isArray: true
    })
    @ApiOperation({
        operationId: `GetList${CONTROLLER_NAME}`
    })
    @Post(`GetList${CONTROLLER_NAME}`)
    async GetList() {
        return null;
        return null;
    }
    @ApiResponse({
        type: Conversation,
    })
    @ApiOperation({
        operationId: `Sync${CONTROLLER_NAME}`
    })
    @Post(`Sync${CONTROLLER_NAME}`)
    async Sync() {
        return null;
    }
    @ApiOperation({
        operationId: `Log${CONTROLLER_NAME}`
    })
    @Post(`Log${CONTROLLER_NAME}`)
    async Log() {
        return null;
    }
}