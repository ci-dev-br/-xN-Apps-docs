import { Body, Controller, Get, Param, Post, Query, Req, UnauthorizedException } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { MessageService } from "../service/message.service";

@ApiTags('Messager')
@Controller('Messager')
export class MessagerController {
    constructor(
        private readonly messageService: MessageService,
    ) {}

    /**
     * Retorna lista de conversas do usuário conectado
     */
    @Get('Conversations')
    @ApiOperation({ operationId: 'MessagerGetConversations' })
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
    async startConversation(@Body() body: { targetUserId: string }, @Req() req: any) {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedException('É necessário estar autenticado para iniciar conversa.');
        }
        return await this.messageService.obterOuCriarConversa(userId, body.targetUserId, req.user);
    }

    /**
     * Retorna histórico de mensagens de uma conversa (mensagens criptografadas)
     */
    @Get('Conversations/:id/Messages')
    @ApiOperation({ operationId: 'MessagerGetMessages' })
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
    async sendMessage(
        @Param('id') conversationId: string,
        @Body() body: {
            encryptedContent: string;
            attachments?: any[];
            iv?: string;
        },
        @Req() req: any,
    ) {
        const user = req.user;
        if (!user?.id) {
            throw new UnauthorizedException('É necessário estar autenticado.');
        }

        const senderName = user.surname || user.fullName || user.username || 'Usuário';
        const senderPhoto = user.photo?.uri || user.photo?.url;

        return await this.messageService.enviarMensagem({
            conversationId,
            senderId: user.id,
            senderName,
            senderPhoto,
            encryptedContent: body.encryptedContent,
            attachments: body.attachments,
            iv: body.iv,
        });
    }

    /**
     * Lista usuários disponíveis para iniciar novas conversas
     */
    @Get('Users')
    @ApiOperation({ operationId: 'MessagerListUsers' })
    async listUsers(@Query('search') search: string, @Req() req: any) {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedException('É necessário estar autenticado.');
        }
        return await this.messageService.listarUsuarios(userId, search);
    }
}