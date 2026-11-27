import { ApiProperty } from "@nestjs/swagger";
import { Credential } from "@ci/core";
import { User } from "@ci/auth/models/user.entity";
export class RegistrarInputDto {
    @ApiProperty({ required: false, nullable: true })
    identificacao?: string;
    @ApiProperty({ required: false, nullable: true })
    fullName?: string;
    @ApiProperty({ required: false, nullable: true })
    surname?: string;
    @ApiProperty({ required: false, nullable: true })
    email?: string;
    @ApiProperty({ required: false, nullable: true })
    password?: string;
    @ApiProperty({ required: false, nullable: true })
    phone?: string;
    @ApiProperty({ required: false, nullable: true })
    emailAuthorization?: boolean;
    @ApiProperty({ required: false, nullable: true })
    phoneAuthorization?: boolean;
    @ApiProperty({ required: false, nullable: true, description: 'Invite hash recebido por e-mail' })
    invite?: string;
    @ApiProperty({ required: false, nullable: true, description: 'Alias para invite hash' })
    convite?: string;
}
export class AcessoPayload {
    @ApiProperty({ required: false, nullable: true })
    identificacao?: string;
    @ApiProperty({ required: false, nullable: true })
    solicitarSessao?: string;
    @ApiProperty({ required: false, nullable: true })
    chaveAcesso?: string;
    @ApiProperty({ required: false, nullable: true })
    password?: string;
    @ApiProperty({ required: false, nullable: true })
    user?: User;
    @ApiProperty({ required: false, nullable: true })
    bearer?: string;
    @ApiProperty({ required: false, nullable: true })
    refreshToken?: string;
    @ApiProperty({ required: false, nullable: true })
    mode?: string;
    constructor(chave?: Credential, mode?: string) {
        if (chave instanceof Credential) {
            this.chaveAcesso = chave.id;
            this.user = new User();
            this.user.id = chave.identifiedUser;
        }
        if (!!mode) this.mode = mode;
    }
}
export class RefreshPayloadInputDto {
    @ApiProperty({ required: true, nullable: false })
    refreshToken: string;
    @ApiProperty({ required: false, nullable: true })
    chaveAcesso?: string;
}
export class AuthorizationOutput {
    @ApiProperty({ required: true, nullable: false })
    authorization: string;
    @ApiProperty({ required: false, nullable: true })
    chaveAcesso?: string;
}
export class SolicitarVerificacaoEmailInputDto {
    @ApiProperty({ required: false, nullable: true, description: 'URL de origem para compor o link de confirmação' })
    originUrl?: string;
}
export class SolicitarVerificacaoEmailOutputDto {
    @ApiProperty({ required: true, description: 'Indica se o e-mail de verificação foi enviado' })
    sent: boolean;
    @ApiProperty({ required: false, nullable: true, description: 'Indica se o e-mail já estava verificado' })
    alreadyVerified?: boolean;
    @ApiProperty({ required: false, nullable: true, description: 'Endereço de e-mail destinatário' })
    email?: string;
    @ApiProperty({ required: false, nullable: true, description: 'Mensagem informativa do resultado' })
    message?: string;
}
export class ConfirmarEmailInputDto {
    @ApiProperty({ required: true, nullable: false, description: 'Token de verificação recebido por e-mail' })
    token: string;
}
export class ConfirmarEmailOutputDto {
    @ApiProperty({ required: true, description: 'Indica se o e-mail foi confirmado com sucesso' })
    verified: boolean;
    @ApiProperty({ required: false, nullable: true, description: 'Indica se o e-mail já estava confirmado anteriormente' })
    alreadyVerified?: boolean;
    @ApiProperty({ required: false, nullable: true, description: 'Endereço de e-mail confirmado' })
    email?: string;
    @ApiProperty({ required: false, nullable: true, description: 'Identificador do usuário verificado' })
    userId?: string;
    @ApiProperty({ required: false, nullable: true, description: 'Mensagem informativa do resultado' })
    message?: string;
}