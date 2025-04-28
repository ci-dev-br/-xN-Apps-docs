import { ApiProperty } from "@nestjs/swagger";
import { ChaveAcesso } from "@ci/core";
import { User } from "@ci/auth/models/user.entity";
export class RegistrarInputDto {
    @ApiProperty({ required: false, nullable: true })
    identificacao?: string;
    @ApiProperty({ required: false, nullable: true })
    email?: string;
    @ApiProperty({ required: false, nullable: true })
    password?: string;
    @ApiProperty({ required: false, nullable: true })
    phone?: string;
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
    constructor(chave?: ChaveAcesso, mode?: string) {
        if (chave instanceof ChaveAcesso) {
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
}
export class AuthorizationOutput {
    @ApiProperty({ required: true, nullable: false })
    authorization: string;
}