import { ApiProperty } from "@nestjs/swagger";

export class CriarOrganizacaoDto {
    @ApiProperty({ required: true })
    organizatioName: string;

    @ApiProperty({ required: false, nullable: true })
    description?: string;

    @ApiProperty({ required: false, nullable: true })
    cnpj?: string;

    @ApiProperty({ required: false, nullable: true })
    website?: string;
}

export class AtualizarOrganizacaoDto {
    @ApiProperty({ required: false, nullable: true })
    organizatioName?: string;

    @ApiProperty({ required: false, nullable: true })
    description?: string;

    @ApiProperty({ required: false, nullable: true })
    cnpj?: string;

    @ApiProperty({ required: false, nullable: true })
    website?: string;
}

export class CriarOrganizacaoRoleDto {
    @ApiProperty({ required: true, description: 'Nome personalizado do role (receberá prefixo ORG se não informado)' })
    name: string;

    @ApiProperty({ required: false, nullable: true })
    description?: string;
}

export class CompartilharOrganizacaoDto {
    @ApiProperty({ required: false, nullable: true, description: 'ID do usuário destino' })
    userId?: string;

    @ApiProperty({ required: false, nullable: true, description: 'E-mail ou username do usuário destino' })
    emailOrUsername?: string;

    @ApiProperty({ required: false, type: [String], description: 'Roles com prefixo ORG atribuídos ao usuário' })
    roles?: string[];
}

export class AtribuirRolesMembroDto {
    @ApiProperty({ required: true, type: [String], description: 'Lista de roles com prefixo ORG' })
    roles: string[];
}
