import { ApiProperty } from "@nestjs/swagger";

export class TypeScriptResourceInputDto {
    @ApiProperty({ description: 'Caminho do arquivo solicitado no workspace' })
    filePath: string;

    @ApiProperty({ required: false, description: 'Conteúdo opcional do arquivo ativo' })
    fileContent?: string;

    @ApiProperty({ required: false, description: 'Profundidade máxima de resolução recursiva', default: 2 })
    maxDepth?: number;
}

export class TypeScriptResourceFileDto {
    @ApiProperty()
    path: string;

    @ApiProperty()
    virtualUri: string;

    @ApiProperty()
    content: string;

    @ApiProperty()
    isDeclaration: boolean;

    @ApiProperty({ required: false })
    source?: string;
}

export class TypeScriptResourcesOutputDto {
    @ApiProperty({ type: [TypeScriptResourceFileDto] })
    files: TypeScriptResourceFileDto[];

    @ApiProperty({ required: false })
    compilerOptions?: any;

    @ApiProperty({ required: false })
    aliases?: Record<string, string[]>;
}

export class TypeScriptDefinitionInputDto {
    @ApiProperty({ description: 'Caminho do arquivo no workspace' })
    filePath: string;

    @ApiProperty({ required: false })
    fileContent?: string;

    @ApiProperty({ required: false, description: 'Número da linha (1-indexed)' })
    line?: number;

    @ApiProperty({ required: false, description: 'Número da coluna (1-indexed)' })
    column?: number;

    @ApiProperty({ required: false, description: 'Nome do símbolo ou import' })
    symbolName?: string;
}

export class TypeScriptDefinitionOutputDto {
    @ApiProperty()
    found: boolean;

    @ApiProperty({ required: false })
    targetPath?: string;

    @ApiProperty({ required: false })
    targetLine?: number;

    @ApiProperty({ required: false })
    targetColumn?: number;

    @ApiProperty({ required: false })
    targetEndLine?: number;

    @ApiProperty({ required: false })
    targetEndColumn?: number;

    @ApiProperty({ required: false })
    symbolName?: string;

    @ApiProperty({ required: false })
    declarationSnippet?: string;

    @ApiProperty({ required: false })
    documentation?: string;
}

export class TypeScriptDocumentationInputDto {
    @ApiProperty({ description: 'Caminho do arquivo no workspace' })
    filePath: string;

    @ApiProperty({ required: false })
    fileContent?: string;

    @ApiProperty({ required: false })
    line?: number;

    @ApiProperty({ required: false })
    column?: number;

    @ApiProperty({ required: false })
    symbolName?: string;
}

export class TypeScriptDocumentationOutputDto {
    @ApiProperty()
    symbolName: string;

    @ApiProperty()
    kind: string;

    @ApiProperty()
    signature: string;

    @ApiProperty()
    description: string;

    @ApiProperty({ required: false })
    params?: Array<{ name: string; type?: string; description?: string }>;

    @ApiProperty({ required: false })
    returns?: { type?: string; description?: string };

    @ApiProperty({ required: false })
    tags?: Array<{ tag: string; comment?: string }>;

    @ApiProperty()
    markdown: string;
}

export class TypeScriptPackageDocInputDto {
    @ApiProperty({ description: 'Nome do pacote ou módulo instalado (ex: @angular/core, rxjs)' })
    packageName: string;

    @ApiProperty({ required: false, description: 'Caminho do arquivo de referência para localizar o node_modules' })
    filePath?: string;
}

export class TypeScriptExportedSymbolDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    kind: string;

    @ApiProperty()
    signature: string;

    @ApiProperty({ required: false })
    documentation?: string;

    @ApiProperty({ required: false })
    line?: number;

    @ApiProperty({ required: false })
    column?: number;

    @ApiProperty({ required: false })
    dtsPath?: string;
}

export class TypeScriptPackageDocOutputDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    version: string;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty({ required: false })
    homepage?: string;

    @ApiProperty({ required: false })
    repository?: string;

    @ApiProperty({ required: false })
    license?: string;

    @ApiProperty({ required: false })
    typesPath?: string;

    @ApiProperty({ required: false })
    readmeSnippet?: string;

    @ApiProperty({ type: [TypeScriptExportedSymbolDto] })
    exportedSymbols: TypeScriptExportedSymbolDto[];

    @ApiProperty()
    markdown: string;
}

export class TypeScriptInstalledPackagesInputDto {
    @ApiProperty({ required: false, description: 'Caminho do arquivo de referência para localizar pacotes usados' })
    filePath?: string;

    @ApiProperty({ required: false, description: 'Conteúdo opcional do arquivo para extrair imports' })
    fileContent?: string;
}

export class TypeScriptInstalledPackageSummaryDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    version: string;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty({ required: false })
    homepage?: string;

    @ApiProperty({ required: false })
    license?: string;

    @ApiProperty()
    isUsedInFile: boolean;
}

export class TypeScriptInstalledPackagesOutputDto {
    @ApiProperty({ type: [TypeScriptInstalledPackageSummaryDto] })
    packages: TypeScriptInstalledPackageSummaryDto[];
}

