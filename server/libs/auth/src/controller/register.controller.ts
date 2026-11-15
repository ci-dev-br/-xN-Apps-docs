import { Controller, Get, Post, Query } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { Public } from "../decorators/public.decorator";
import { Body, Request } from '@nestjs/common';
import { RegistrarInputDto } from './dto/dto';
import { ApiOperation } from '@nestjs/swagger';
import { RegisterService, registerToMessagePayload } from "../service/register.service";
import { Register } from "../models/register.entity";
import { MailService } from "@ci/notification/services/mail.service";
import { templateHtml } from "@ci/core/template/load-template.fn";
import { createHash } from "crypto";
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
        try {
            // req.header('Origin')
            if ((!!input?.email || !!input?.phone) && !input.identificacao) {
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
            }
            else if (input.identificacao || (input as any)?.emailOrPhone) {
                const contactEmail = (input.email || input.identificacao || (input as any)?.emailOrPhone || '').trim();
                const register = await this.register.register({
                    mail: contactEmail || input.email,
                    emailAuthorization: true,
                });

                const inviteHash = createHash('sha256').update(
                    register.internalId.substring(8)
                ).digest('hex').toString();

                const originUrl = (req as any)?.headers?.origin ||
                    ((req as any)?.headers?.referer ? (() => { try { return new URL((req as any).headers.referer).origin; } catch { return undefined; } })() : undefined);
                const baseUrl = (originUrl || 'https://apps.ci.dev.br').replace(/\/+$/, '');
                const actUrl = `${baseUrl}/registrar/${inviteHash}`;

                if (!!contactEmail) {
                    try {
                        this.mails.requestSendMessageToMail(
                            registerToMessagePayload(register, baseUrl, inviteHash)
                        );
                    } catch (error) {
                        console.trace(error);
                    }
                    this.mails.requestSendMessageToMail({
                        template_html: templateHtml('register--initial-confirmation-template', {
                            logo_base64: '',
                            act_url: actUrl,
                            new_report_link: `${baseUrl}/suporte/novo?assunto=Problema%20no%20registro%20de%20conta%20de%20e-mail`,
                            unsubscribe_link: `${baseUrl}/?unsubscribe=${encodeURIComponent(contactEmail)}`,
                            footer_assinatura: 'ci.dev.br',
                            ano: String(new Date().getFullYear()),
                            footer_message: 'ci.dev.br | Soluções Digitais',
                        }),
                        from: 'apps@ci.dev.br',
                        to: contactEmail,
                    })
                }
                return {
                    ...register,
                    inviteHash,
                    act_url: actUrl,
                };
            }
            else {
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
        } catch (error) {
            let mensagem_error = 'Não foi possível realizar o registro, tente novamente mais tarde.';
            try {
                console.trace(error);
                mensagem_error = error?.message || mensagem_error;
            } catch (e) {
                console.trace(e);
            }
            return {
                status: 500,
                message: mensagem_error,

            }
        }
    }
}