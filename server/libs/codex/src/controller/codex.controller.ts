import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CodexService } from "../service/codex.service";
import {
    TypeScriptDefinitionInputDto,
    TypeScriptDefinitionOutputDto,
    TypeScriptDocumentationInputDto,
    TypeScriptDocumentationOutputDto,
    TypeScriptInstalledPackagesInputDto,
    TypeScriptInstalledPackagesOutputDto,
    TypeScriptPackageDocInputDto,
    TypeScriptPackageDocOutputDto,
    TypeScriptResourceInputDto,
    TypeScriptResourcesOutputDto
} from "./dto/typescript-resource.dto";

@ApiTags('Codex')
@Controller('Codex')
export class CodexController {
    constructor(
        private readonly codexService: CodexService,
    ) { }

    @Post('typescript/resources')
    @ApiOperation({
        summary: 'Carrega recursos avançados de TypeScript para o Monaco Editor',
        operationId: 'GetTypeScriptResources'
    })
    @ApiResponse({
        status: 200,
        description: 'Arquivos de declaração, dependências e opções do compilador resolvidos',
        type: TypeScriptResourcesOutputDto
    })
    async getTypeScriptResources(
        @Body() input: TypeScriptResourceInputDto
    ): Promise<TypeScriptResourcesOutputDto> {
        return await this.codexService.getTypeScriptResources(input);
    }

    @Post('typescript/definition')
    @ApiOperation({
        summary: 'Resolve a definição de um símbolo (Go to Definition, F12, Ctrl+Click)',
        operationId: 'ResolveTypeScriptDefinition'
    })
    @ApiResponse({
        status: 200,
        description: 'Arquivo de destino, linha, coluna e informações da declaração',
        type: TypeScriptDefinitionOutputDto
    })
    async resolveDefinition(
        @Body() input: TypeScriptDefinitionInputDto
    ): Promise<TypeScriptDefinitionOutputDto> {
        return await this.codexService.resolveDefinition(input);
    }

    @Post('typescript/documentation')
    @ApiOperation({
        summary: 'Extrai a documentação e comentários JSDoc de um símbolo ou módulo',
        operationId: 'GetTypeScriptDocumentation'
    })
    @ApiResponse({
        status: 200,
        description: 'Documentação Markdown, assinatura e parâmetros extraídos via AST',
        type: TypeScriptDocumentationOutputDto
    })
    async getDocumentation(
        @Body() input: TypeScriptDocumentationInputDto
    ): Promise<TypeScriptDocumentationOutputDto> {
        return await this.codexService.getDocumentation(input);
    }

    @Post('typescript/package-doc')
    @ApiOperation({
        summary: 'Obtém documentação completa de um módulo/pacote instalado em node_modules',
        operationId: 'GetPackageDocumentation'
    })
    @ApiResponse({
        status: 200,
        description: 'Metadados do pacote, README, tipagens e símbolos exportados',
        type: TypeScriptPackageDocOutputDto
    })
    async getPackageDocumentation(
        @Body() input: TypeScriptPackageDocInputDto
    ): Promise<TypeScriptPackageDocOutputDto> {
        return await this.codexService.getPackageDocumentation(input);
    }

    @Post('typescript/installed-packages')
    @ApiOperation({
        summary: 'Lista pacotes instalados e módulos utilizados no arquivo ativo',
        operationId: 'GetInstalledPackages'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de módulos instalados com versão e descrição',
        type: TypeScriptInstalledPackagesOutputDto
    })
    async getInstalledPackages(
        @Body() input: TypeScriptInstalledPackagesInputDto
    ): Promise<TypeScriptInstalledPackagesOutputDto> {
        return await this.codexService.getInstalledPackages(input);
    }
}