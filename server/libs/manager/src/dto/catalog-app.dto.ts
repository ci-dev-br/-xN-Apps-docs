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

    @ApiProperty({ required: false, description: 'Caminho da pasta do repositório onde reside a aplicação' })
    folderPath?: string;

    @ApiProperty({ required: false, isArray: true, type: String, description: 'Autores dos commits da pasta' })
    authors?: string[];

    @ApiProperty({ required: false, isArray: true, type: String, description: 'Co-autores identificados nas mensagens dos commits' })
    coAuthors?: string[];

    @ApiProperty({ required: false, description: 'Quantidade de commits na pasta da aplicação' })
    commitCount?: number;

    @ApiProperty({ required: false, description: 'Data do último commit da aplicação' })
    lastCommitDate?: string | Date;

    @ApiProperty({ required: false, description: 'Políticas contextuais adicionais' })
    contextPolicies?: Record<string, any>;

    @ApiProperty({ required: false, isArray: true, type: String, description: 'Módulos ou aplicações padrão combinados' })
    modules?: string[];
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

export class ToggleUserActivationDto {
    @ApiProperty({ required: false, description: 'Chave da aplicação' })
    appKey?: string;

    @ApiProperty({ required: false, description: 'ID da aplicação' })
    applicationId?: string;

    @ApiProperty({ required: false, description: 'Estado desejado da ativação (se omitido, inverte o estado atual)' })
    active?: boolean;
}

export class ToggleGlobalAppDto {
    @ApiProperty({ required: false, description: 'Chave da aplicação' })
    appKey?: string;

    @ApiProperty({ required: false, description: 'ID da aplicação' })
    applicationId?: string;

    @ApiProperty({ required: false, description: 'Status ativo global da aplicação' })
    active?: boolean;
}

export class InstallGitModuleDto {
    @ApiProperty({ description: 'URL do repositório Git da aplicação' })
    gitUrl: string;

    @ApiProperty({ description: 'Nome da classe do módulo NestJS (ex: MeuModuloCustomizadoModule)' })
    moduleName: string;

    @ApiProperty({ description: 'Identificador único da aplicação' })
    appKey: string;

    @ApiProperty({ required: false, description: 'Nome de exibição da aplicação' })
    name?: string;

    @ApiProperty({ required: false, description: 'Rota da aplicação no cliente (ex: /MinhaApp)' })
    routePath?: string;

    @ApiProperty({ required: false, default: 'main', description: 'Branch do repositório' })
    branch?: string;

    @ApiProperty({ required: false, description: 'Configurações e parâmetros do módulo em formato chave-valor' })
    configurations?: Record<string, any>;

    @ApiProperty({ required: false, description: 'Ícone da aplicação' })
    icon?: string;

    @ApiProperty({ required: false, description: 'Descrição da aplicação' })
    description?: string;
}

export class GetStoreDto {
    @ApiProperty({ required: false, description: 'Termo de busca por nome ou descrição' })
    search?: string;

    @ApiProperty({ required: false, description: 'Filtro por categoria' })
    categoria?: string;
}

export class RecordUsageDto {
    @ApiProperty({ description: 'Chave da aplicação utilizada (ex: Mensagens, Financeiro)' })
    appKey: string;

    @ApiProperty({ required: false, description: 'Hash da versão do Git informada pelo cliente' })
    gitVersionHash?: string;

    @ApiProperty({ required: false, description: 'Metadados contextuais da execução' })
    metadata?: Record<string, any>;
}

export class DeveloperGratitudeConfigDto {
    @ApiProperty({ description: 'Valor unitário de cada crédito de gratidão em Reais (R$)' })
    unitValue: number;

    @ApiProperty({ required: false, description: 'Se verdadeiro, converte automaticamente em saldo a cada consumo' })
    autoConvert?: boolean;
}

export class ConvertGratitudeDto {
    @ApiProperty({ required: false, description: 'Quantidade específica de créditos a converter (se omitido, converte todos os pendentes)' })
    credits?: number;
}

