import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiProduces, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserService } from "@ci/auth/auth.module";
import { User } from "@ci/auth/models/user.entity";
import { InvitationPayload } from "../dto/i-send-invitation.payload";
import { Request } from "express";
@ApiTags('User')
@Controller('User')
export class UserController {
    constructor(
        private readonly user?: UserService,
    ) { }
    /**
     *  Sincroniza as informações do usuário.
     * @param req 
     * @param user 
     * @returns 
     */
    @Post('Sync')
    @ApiOperation({ operationId: 'SyncUser' })
    @ApiResponse({
        type: User,
    })
    async sync(
        @Req() req: any,
        @Body() user: User) {
        if (!!req.user?.id && req.user?.id === user.id) {
            return await this.user.sync(user);
        }
    }
    /**
     *  Obtém a lista de usuários do sistema.
     * @param req 
     * @returns 
     */
    @Post('GetList')
    @ApiOperation({ operationId: 'GetListUser' })
    @ApiResponse({
        type: User,
        isArray: true
    })
    async getList(
        @Req() req: any
    ) {
        try {
            let users = (await this.user.find(undefined, req))
                ?.map(u => {
                    try {
                        delete u.password;
                        if (!!u.email) {
                            u.email = u.email.substring(0, 3) + '***' + u.email.substring(u.email.length - 8, 3);
                        }
                        delete u.email;
                        delete u.passwordMode;
                    } catch (error) {
                        console.error('Erro ao ocultar dados do usuário.', error);
                    }
                    return u;
                });

            return users;
        } catch (error) {
            throw error;
        }
    }
}