import { Controller, Post } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { Public } from "../decorators/public.decorator";
import { Body, Request } from '@nestjs/common';
import { RegistrarInputDto } from './dto/dto';
import { ApiOperation } from '@nestjs/swagger';
import { RegisterService } from "../service/register.service";
import { Register } from "../models/register.entity";
@ApiTags('Register')
@Controller('Register')
export class RegisterController {
    constructor(
        private readonly register: RegisterService,
    ) { }
    @Public()
    @Post('requestRegisterByFistContact')
    @ApiOperation({ operationId: 'RegistrarAuth' })
    @ApiResponse({ type: Register })
    async requestRegisterByFistContact(
        @Request() req: Request,
        @Body() input?: RegistrarInputDto,
    ) {
        if ((!!input.email || !!input.phone) && !input.identificacao) {
            await this.register.register({
                mail: input.email
            });
            // TODO: solicitar verificação do e-mail de contato do usuário cadastrante (Cliente ou Desenvolvedor).        
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
    } catch(error) {
        console.trace(error);
        return {
            status: 500,
            message: String(error),
            error: {
                severity: error.severity,
                detail: error.detail,
            }
        }
    }
}