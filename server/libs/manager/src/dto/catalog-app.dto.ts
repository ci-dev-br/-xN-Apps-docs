import { ApiProperty } from "@nestjs/swagger";

export class CatalogAppDto {
    @ApiProperty({ description: 'Chave única da aplicação (ex: Mensagens, Arquivos)' })
    appKey: string;

    @ApiProperty({ required: false, description: 'Rota da aplicação no painel' })
    routePath?: string;

    @ApiProperty({ required: false, description: 'Nome da aplicação' })
    name?: string;

    @ApiProperty({ required: false, description: 'Descrição da aplicação' })
    description?: string;

    @ApiProperty({ required: false, description: 'Ícone da aplicação' })
    icon?: string;

    @ApiProperty({ required: false, description: 'Categoria' })
    categoria?: string;

    @ApiProperty({ required: false, isArray: true, type: String, description: 'Papéis necessários' })
    roles?: string[];

    @ApiProperty({ required: false, description: 'Hash do commit Git' })
    gitVersionHash?: string;

    @ApiProperty({ required: false, isArray: true, type: String, description: 'Colaboradores' })
    collaborators?: string[];

    @ApiProperty({ required: false, description: 'Políticas contextuais adicionais' })
    contextPolicies?: Record<string, any>;
}

export class CanLoadAppDto {
    @ApiProperty({ description: 'Chave única da aplicação' })
    appKey: string;

    @ApiProperty({ required: false, description: 'Tenant ID' })
    tenantId?: string;
}

export class CheckVersionDto {
    @ApiProperty({ description: 'Hash da versão do cliente segundo o Git' })
    versionHash: string;
}

export class ReconcileCatalogDto {
    @ApiProperty({ description: 'Hash da versão do cliente segundo o Git' })
    versionHash: string;

    @ApiProperty({ required: false, description: 'Branch do Git' })
    branch?: string;

    @ApiProperty({ required: false, isArray: true, type: String, description: 'Lista de colaboradores do repositório' })
    collaborators?: string[];

    @ApiProperty({ isArray: true, type: CatalogAppDto, description: 'Lista completa de aplicações ativas no cliente' })
    apps: CatalogAppDto[];
}
