import { ApiProperty } from '@nestjs/swagger';

export class GetListUserDto {
    @ApiProperty({
        required: false,
        nullable: true,
        isArray: true,
        type: String,
        title: 'Tenants para filtro',
    })
    tenantIds?: string[];

    @ApiProperty({
        required: false,
        nullable: true,
        title: 'Tenant único para filtro',
    })
    tenantId?: string;

    @ApiProperty({
        required: false,
        nullable: true,
        title: 'Filtrar por papel (role)',
    })
    role?: string;

    @ApiProperty({
        required: false,
        nullable: true,
        title: 'Busca por nome, username ou e-mail',
    })
    search?: string;
}

export class UserTenantAddDto {
    @ApiProperty({
        required: true,
        title: 'ID do Tenant destino',
    })
    tenantId: string;

    @ApiProperty({
        required: false,
        nullable: true,
        title: 'ID do usuário existente',
    })
    userId?: string;

    @ApiProperty({
        required: false,
        nullable: true,
        title: 'E-mail ou username do usuário existente',
    })
    emailOrUsername?: string;

    @ApiProperty({
        required: false,
        nullable: true,
        isArray: true,
        type: String,
        title: 'Papéis atribuídos ao usuário',
    })
    roles?: string[];
}

export class UserTenantRemoveDto {
    @ApiProperty({
        required: true,
        title: 'ID do Tenant',
    })
    tenantId: string;

    @ApiProperty({
        required: true,
        title: 'ID do usuário',
    })
    userId: string;
}
