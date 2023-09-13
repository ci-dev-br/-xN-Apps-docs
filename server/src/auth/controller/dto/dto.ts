import { ApiProperty } from "@nestjs/swagger";
import { ChaveAcesso } from "src/auth/models/chave-acesso.entity";
import { User } from "src/auth/models/user.entity";

export class RegistrarInputDto {
    @ApiProperty({ required: false })
    identificacao?: string;
    @ApiProperty({ required: false })
    email?: string;
    @ApiProperty({ required: false })
    password?: string;
    @ApiProperty({ required: false })
    phone?: string;
}
export class AcessoPayload {
    @ApiProperty({ required: false })
    identificacao?: string;
    @ApiProperty({ required: false })
    solicitarSessao?: string;
    @ApiProperty({ required: false })
    chaveAcesso?: string;
    @ApiProperty({ required: false })
    password?: string;
    @ApiProperty({ required: false })
    user?: User;
    @ApiProperty({ required: false })
    bearer?: string;
    @ApiProperty({ required: false })
    refreshToken?: string;
    constructor(chave?: ChaveAcesso) {
        if (chave instanceof ChaveAcesso) {
            this.chaveAcesso = chave.id;
            this.user = new User();
            this.user.id = chave.identifiedUser;
        }
    }
}