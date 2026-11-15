import { InvitationPayload } from "@ci/user/dto/i-send-invitation.payload";
import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { InviteService } from "../service/invite.service";
import { User } from "../models/user.entity";
import { Invite } from "../models/invite.entity";
import { Public } from "../decorators/public.decorator";

@ApiTags('Invite')
@Controller('Invite')
export class InviteController {
    constructor(
        private readonly invite: InviteService,
    ) { }

    /**
     * Envia convite para usuário, gerando e enviando o invite-hash por e-mail.
     */
    @Post('SendInvitation')
    @ApiOperation({ operationId: 'SendInvitation' })
    @ApiResponse({ type: Invite })
    async sendInvitation(
        @Body() payload: InvitationPayload,
        @Req() req: Request
    ) {
        const originUrl = (req as any)?.headers?.origin ||
            ((req as any)?.headers?.referer ? (() => { try { return new URL((req as any).headers.referer).origin; } catch { return undefined; } })() : undefined);

        return await this.invite.sendInvitation(
            {
                email: payload.email!,
                friendlyName: payload.friendlyName!,
                mensagem: payload.mensagem!,
            },
            (req as any).user as User,
            originUrl,
            (req as any).chaveAcesso,
        );
    }

    /**
     * Sincroniza (cadastra/atualiza) a entidade Invite via DAO e dispara o e-mail com invite-hash.
     */
    @Post('Sync')
    @ApiOperation({ operationId: 'SyncInvite' })
    @ApiResponse({ type: Invite })
    async sync(
        @Body() payload: any,
        @Req() req: Request
    ) {
        const data = payload?.data || payload?.invite || payload;
        return await this.invite.sync(data, req);
    }

    /**
     * Lista convites cadastrados.
     */
    @Post('Get')
    @ApiOperation({ operationId: 'GetListInvite' })
    @ApiResponse({ type: Invite, isArray: true })
    async getList() {
        return await this.invite.findAll();
    }

    /**
     * Valida o convite (invite-hash) e retorna os dados do convite para o convidado prosseguir com o cadastro.
     */
    @Public()
    @Post('GetInvite')
    @ApiOperation({ operationId: 'GetInvite' })
    @ApiResponse({ type: Invite })
    async GetInvite(
        @Body() payload: InvitationPayload & { invite?: string; inviteHash?: string },
        @Req() req: Request
    ) {
        const code = payload?.convite || payload?.invite || payload?.inviteHash;
        return await this.invite.getInvite(code!);
    }
}