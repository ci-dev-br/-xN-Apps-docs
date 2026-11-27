import { Body, Controller, Param, Post, Req, UnauthorizedException } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { MessageService } from "../service/message.service";
import {
    AvailableUserResponseDto,
    ConversationResponseDto,
    DirectMessageResponseDto,
    ListUsersDto,
    SendMessageDto,
    StartConversationDto,
} from "./dto/messager.dto";

@ApiTags('Messager')
@Controller('Messager')
export class MessagerController {
    constructor(
        private readonly messageService: MessageService,
    ) {}

    /**
     * Retorna lista de conversas do usuário conectado
     */
    @Post('Conversations/List')
    @ApiOperation({ operationId: 'MessagerGetConversations' })
    @ApiResponse({
        type: ConversationResponseDto,
        isArray: true,
        description: 'Lista de conversas do usuário autenticado',
    })
    async getConversations(@Req() req: any) {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedException('É necessário estar autenticado para listar conversas.');
        }
        return await this.messageService.listarConversas(userId);
    }

    /**
     * Inicia ou retorna conversa existente com um usuário destinatário
     */
    @Post('Conversations')
    @ApiOperation({ operationId: 'MessagerStartConversation' })
    @ApiResponse({
        type: ConversationResponseDto,
        description: 'Conversa criada ou obtida com sucesso',
    })
    async startConversation(@Body() body: StartConversationDto, @Req() req: any) {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedException('É necessário estar autenticado para iniciar conversa.');
        }
        return await this.messageService.obterOuCriarConversa(userId, body?.targetUserId, req.user);
    }

    /**
     * Retorna histórico de mensagens de uma conversa (mensagens criptografadas)
     */
    @Post('Conversations/:id/Messages/List')
    @ApiOperation({ operationId: 'MessagerGetMessages' })
    @ApiResponse({
        type: DirectMessageResponseDto,
        isArray: true,
        description: 'Histórico de mensagens cifradas da conversa',
    })
    async getMessages(@Param('id') conversationId: string, @Req() req: any) {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedException('É necessário estar autenticado.');
        }
        return await this.messageService.listarMensagens(conversationId, userId);
    }

    /**
     * Envia mensagem criptografada e anexos em uma conversa
     */
    @Post('Conversations/:id/Messages')
    @ApiOperation({ operationId: 'MessagerSendMessage' })
    @ApiResponse({
        type: DirectMessageResponseDto,
        description: 'Mensagem cifrada registrada e encadeada na conversa',
    })
    async sendMessage(
        @Param('id') conversationId: string,
        @Body() body: SendMessageDto,
        @Req() req: any,
    ) {
        const user = req.user;
        if (!user?.id) {
            throw new UnauthorizedException('É necessário estar autenticado.');
        }

        const senderName = user.surname || user.fullName || user.username || 'Usuário';
        const senderPhoto = user.photo?.internalId
            ? `/Storage/Photo/${user.photo.internalId}`
            : (user.photo?.uri || user.photo?.url);

        return await this.messageService.enviarMensagem({
            conversationId,
            senderId: user.id,
            senderName,
            senderPhoto,
            encryptedContent: body?.encryptedContent,
            attachments: body?.attachments,
            iv: body?.iv,
        });
    }

    /**
     * Lista usuários disponíveis para iniciar novas conversas
     */
    @Post('Users')
    @ApiOperation({ operationId: 'MessagerListUsers' })
    @ApiResponse({
        type: AvailableUserResponseDto,
        isArray: true,
        description: 'Lista de usuários disponíveis para conversa',
    })
    async listUsers(@Body() body: ListUsersDto, @Req() req: any) {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedException('É necessário estar autenticado.');
        }
        return await this.messageService.listarUsuarios(userId, body?.search);
    }
}