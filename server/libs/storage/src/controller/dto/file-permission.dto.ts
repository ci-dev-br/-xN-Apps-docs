import { ApiProperty } from "@nestjs/swagger";

export class RequestFilePermissionInputDto {
    @ApiProperty({ required: true, description: 'Caminho da pasta para a qual se solicita permissão' })
    path: string;

    @ApiProperty({ required: false, nullable: true, description: 'Justificativa da solicitação de acesso' })
    reason?: string;

    @ApiProperty({ required: false, nullable: true, description: 'URL de origem para compor o link de autorização' })
    originUrl?: string;
}

export class RequestFilePermissionOutputDto {
    @ApiProperty()
    requested: boolean;

    @ApiProperty({ required: false })
    alreadyAuthorized?: boolean;

    @ApiProperty()
    path: string;

    @ApiProperty({ required: false })
    status?: string;

    @ApiProperty({ required: false })
    requestToken?: string;

    @ApiProperty({ required: false })
    emailsSent?: number;

    @ApiProperty({ required: false })
    sysadminCount?: number;

    @ApiProperty({ required: false })
    authorizeLink?: string;

    @ApiProperty({ required: false })
    message?: string;
}

export class AuthorizeFilePermissionInputDto {
    @ApiProperty({ required: false, nullable: true, description: 'Token único recebido no e-mail de autorização' })
    token?: string;

    @ApiProperty({ required: false, nullable: true, description: 'Identificador interno da permissão' })
    internalId?: string;

    @ApiProperty({ required: false, enum: ['GRANT', 'DENY'], description: 'Decisão do SYSADMIN (GRANT ou DENY)' })
    decision?: 'GRANT' | 'DENY';
}

export class AuthorizeFilePermissionOutputDto {
    @ApiProperty()
    authorized: boolean;

    @ApiProperty({ required: false })
    denied?: boolean;

    @ApiProperty({ required: false })
    path?: string;

    @ApiProperty({ required: false })
    status?: string;

    @ApiProperty({ required: false })
    requestedByUserId?: string;

    @ApiProperty({ required: false })
    requestedByEmail?: string;

    @ApiProperty({ required: false })
    message?: string;
}

export class GetPermissionRequestInputDto {
    @ApiProperty({ required: true })
    token: string;
}

export class FilePermissionItemDto {
    @ApiProperty({ required: false })
    internalId?: string;

    @ApiProperty({ required: false })
    role?: string;

    @ApiProperty({ required: false })
    status?: string;

    @ApiProperty({ required: false })
    path?: string;

    @ApiProperty({ required: false })
    requestedByUserId?: string;

    @ApiProperty({ required: false })
    requestedByEmail?: string;

    @ApiProperty({ required: false })
    requestedByName?: string;

    @ApiProperty({ required: false })
    reason?: string;

    @ApiProperty({ required: false })
    authorizedAt?: Date;

    @ApiProperty({ required: false })
    createdAt?: Date;
}

export class MyFilePermissionsOutputDto {
    @ApiProperty({ type: [String] })
    authorizedPaths: string[];

    @ApiProperty({ type: [FilePermissionItemDto] })
    permissions: FilePermissionItemDto[];

    @ApiProperty({ type: [FilePermissionItemDto] })
    pendingRequests: FilePermissionItemDto[];
}
