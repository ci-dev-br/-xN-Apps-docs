import { InvitationPayload } from "@ci/user/dto/i-send-invitation.payload";
import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { InviteService } from "../service/invite.service";
import { User } from "../models/user.entity";
import { Public } from "../decorators/public.decorator";
@ApiTags('Invite')
@Controller('Invite')
export class InviteController {
    constructor(
        private readonly invite: InviteService,
    ) { }
    /**
     *  Envia convite para usuário.
     * @param req 
     * @param user 
     * @returns 
     */
    @Post('SendInvitation')
    @ApiOperation({ operationId: 'SendInvitation' })
    async sendInvitation(
        @Body() payload: InvitationPayload,
        @Req() req: Request) {
        this.invite.sendInvitation({
            email: payload.email!,
            friendlyName: payload.friendlyName!,
            mensagem: payload.mensagem!,
        }, (req as any).user as User);
    }
    /**
     * Valida o convite e retorna os dados do convite.
     */
    @Public()
    @Post('GetInvite')
    @ApiOperation({ operationId: 'GetInvite' })
    async GetInvite(
        @Body() payload: InvitationPayload,
        @Req() req: Request) {
        this.invite.getInvite(payload.convite);
    }
}