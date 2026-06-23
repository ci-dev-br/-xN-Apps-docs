import { Controller, Post } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { Public } from "../decorators/public.decorator";
import { Body, Request } from '@nestjs/common';
import { RegistrarInputDto } from './dto/dto';
import { ApiOperation } from '@nestjs/swagger';
import { RegisterService, registerToMessagePayload } from "../service/register.service";
import { Register } from "../models/register.entity";
import { MailService } from "@ci/notification/services/mail.service";
@ApiTags('Register')
@Controller('Register')
export class RegisterController {
    constructor(
        private readonly register: RegisterService,
        private readonly mails: MailService,
    ) { }
    @Public()
    @Post('RequestRegisterByFistContact')
    @ApiOperation({ operationId: 'RequestRegisterByFistContact' })
    @ApiResponse({ type: Register })
    async requestRegisterByFistContact(
        @Request() req: Request,
        @Body() input?: RegistrarInputDto,
    ) {
        // req.header('Origin')
        if ((!!input.email || !!input.phone) && !input.identificacao) {
            const register = await this.register.register({
                mail: input.email,
                emailAuthorization: input.emailAuthorization,
                phone: input.phone,
                phoneAuthorization: input.phoneAuthorization,
            });
            // TODO: solicitar verificação do e-mail de contato do usuário cadastrante (Cliente ou Desenvolvedor).        
            if (!!input.email) {
                try {
                    this.mails.requestSendMessageToMail(
                        registerToMessagePayload(register)
                    );
                } catch (error) {
                    console.trace(error);
                }
                this.mails.requestSendMessageToMail({
                    template_html: 'bem-vindo',
                    from: 'apps@ci.dev.br',
                    to: input.email,

                })
            }
        } else {
            throw new Error('Erro temporário, tente novamente mais tarde.');
        }
        /* const created_user = await this.userService.registrar({
           email: input.email,
           fullName: input.fullName,
           emailVerificado: false,
           surname: input.surname,
           password: await argon2.hash(input.password),
           username: input.identificacao,
           phone: input.phone,
           passwordMode: 'argon2',
         });
         return created_user; */
    } /* catch(error) {
        console.trace(error);
        return {
            status: 500,
            message: String(error),
            error: {
                severity: error.severity,
                detail: error.detail,
            }
        }
    } */
}