import { SendInvitationPayload } from "@ci/user/dto/i-send-invitation.payload";
import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { InviteService } from "../service/invite.service";
import { User } from "../models/user.entity";

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
        @Body() payload: SendInvitationPayload,
        @Req() req: Request) {
        this.invite.sendInvitation({
            email: payload.email!,
            friendlyName: payload.friendlyName!,
            mensagem: payload.mensagem!,
        }, (req as any).user as User);
    }
}