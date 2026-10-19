import { Injectable, Optional } from "@nestjs/common";
import { CodeBlock } from "../models/code-block.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { DaoFullAuditedServiceBase, SnapshotService } from "@ci/core";
import * as ts from 'typescript';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve, basename } from 'node:path';
import {
    TypeScriptDefinitionInputDto,
    TypeScriptDefinitionOutputDto,
    TypeScriptDocumentationInputDto,
    TypeScriptDocumentationOutputDto,
    TypeScriptExportedSymbolDto,
    TypeScriptInstalledPackageSummaryDto,
    TypeScriptInstalledPackagesInputDto,
    TypeScriptInstalledPackagesOutputDto,
    TypeScriptPackageDocInputDto,
    TypeScriptPackageDocOutputDto,
    TypeScriptResourceFileDto,
    TypeScriptResourceInputDto,
    TypeScriptResourcesOutputDto
} from "../controller/dto/typescript-resource.dto";

@Injectable()
export class CodexService extends DaoFullAuditedServiceBase<CodeBlock> {
    constructor(
        @Optional() snap?: SnapshotService,
        @Optional() @InjectRepository(CodeBlock) private readonly codeBlockRepo?: Repository<CodeBlock>,
    ) {
        super(snap as any, codeBlockRepo as any);
    }

    /**
     * Resolve caminhos relativos ao diretório do projeto ou workspace raiz
     */
    public resolveExistingPath(rawPath?: string): string {
        if (!rawPath || !rawPath.trim()) return './';
        let normalized = rawPath.trim().replace(/\\/g, '/');

        // Se for no formato /c:/... normaliza para c:/...
        if (/^\/[a-zA-Z]:/.test(normalized)) {
            normalized = normalized.substring(1);
        } else if (normalized.startsWith('/') && !/^[a-zA-Z]:/.test(normalized)) {
            normalized = normalized.replace(/^\/+/, '');
        }

        if (isAbsolute(normalized) && existsSync(normalized)) {
            return normalized;
        }

        if (!normalized.startsWith('./') && !normalized.startsWith('../')) {
            normalized = `./${normalized}`;
        }

        if (existsSync(normalized)) {
            return normalized;
        }

        // Tenta resolver buscando a partir do diretório pai (raiz do repositório)
        const parentCandidate = normalized.startsWith('./')
            ? `../${normalized.substring(2)}`
            : `../${normalized}`;

        if (existsSync(parentCandidate)) {
            return parentCandidate;
        }

        // Tenta resolver na pasta ../apps/ caso o caminho comece com projects/
        if (normalized.startsWith('./projects/')) {
            const appsCandidate = `../apps/${normalized.substring(2)}`;
            if (existsSync(appsCandidate)) {
                return appsCandidate;
            }
        }

        // Tenta resolver na pasta ./apps/ caso o cwd seja a raiz do repositório
        if (normalized.startsWith('./projects/')) {
            const appsCandidateDirect = `./apps/${normalized.substring(2)}`;
            if (existsSync(appsCandidateDirect)) {
                return appsCandidateDirect;
            }
        }

        return normalized;
    }

    /**
     * Converte um caminho absoluto ou com prefixos de diretório pai para o caminho relativo ao workspace
     */
    public toWorkspaceRelativePath(fullPath: string): string {
        if (!fullPath) return '';
        let normalized = fullPath.replace(/\\/g, '/');
        if (/^\/[a-zA-Z]:/.test(normalized)) {
            normalized = normalized.substring(1);
        }

        const cwd = process.cwd().replace(/\\/g, '/');
        const repoRoot = cwd.endsWith('/server') ? cwd.substring(0, cwd.length - 7) : cwd;

        if (normalized.toLowerCase().startsWith(repoRoot.toLowerCase())) {
            normalized = normalized.substring(repoRoot.length).replace(/^\/+/, '');
        }

        // Remove prefixos ../ ou ./
        normalized = normalized.replace(/^(\.\.\/|\.\/)+/, '');

        return normalized;
    }

    /**
     * Localiza e analisa o tsconfig.json mais próximo do arquivo
     */
    public getProjectTsConfig(targetFilePath: string): {
        configPath?: string;
        compilerOptions: ts.CompilerOptions;
        paths?: Record<string, string[]>;
    } {
        const fullPath = this.resolveExistingPath(targetFilePath);
        let currentDir = existsSync(fullPath) && statSync(fullPath).isDirectory()
            ? fullPath
            : dirname(fullPath);

        const configNames = ['tsconfig.json', 'tsconfig.app.json', 'tsconfig.lib.json', 'tsconfig.base.json'];

        for (let i = 0; i < 6; i++) {
            for (const name of configNames) {
                const candidate = join(currentDir, name);
                if (existsSync(candidate)) {
                    try {
                        const readResult = ts.readConfigFile(candidate, ts.sys.readFile);
                        if (readResult.config) {
                            const parsed = ts.parseJsonConfigFileContent(
                                readResult.config,
                                ts.sys,
                                currentDir
                            );
                            return {
                                configPath: candidate,
                                compilerOptions: parsed.options,
                                paths: (readResult.config.compilerOptions?.paths as Record<string, string[]>) || undefined
                            };
                        }
                    } catch { }
                }
            }
            const parent = dirname(currentDir);
            if (parent === currentDir) break;
            currentDir = parent;
        }

        return { compilerOptions: {} };
    }

    /**
     * Carrega recursos e definições avançadas TypeScript para alimentar o Monaco Editor
     */
    public async getTypeScriptResources(input: TypeScriptResourceInputDto): Promise<TypeScriptResourcesOutputDto> {
        const rawPath = input.filePath;
        const targetPath = this.resolveExistingPath(rawPath);
        const resolvedFiles: Map<string, TypeScriptResourceFileDto> = new Map();

        const tsConfig = this.getProjectTsConfig(targetPath);
        const compilerOptions = tsConfig.compilerOptions || {};
        const aliases = tsConfig.paths || {};

        let content = input.fileContent;
        if (!content && existsSync(targetPath) && statSync(targetPath).isFile()) {
            try {
                content = readFileSync(targetPath, 'utf-8');
            } catch { }
        }

        const baseDir = existsSync(targetPath) && statSync(targetPath).isDirectory()
            ? targetPath
            : dirname(targetPath);

        // 1. Carrega arquivos irmãos (.ts/.d.ts) no mesmo diretório
        if (existsSync(baseDir) && statSync(baseDir).isDirectory()) {
            try {
                const entries = readdirSync(baseDir, { withFileTypes: true });
                for (const entry of entries) {
                    if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.d.ts'))) {
                        const siblingPath = join(baseDir, entry.name).replace(/\\/g, '/');
                        if (siblingPath !== targetPath.replace(/\\/g, '/')) {
                            this.addFileToResourceMap(siblingPath, resolvedFiles, 'sibling');
                        }
                    }
                }
            } catch { }
        }

        // 2. Extrai e resolve imports do arquivo
        if (content) {
            const sourceFile = ts.createSourceFile(
                targetPath,
                content,
                ts.ScriptTarget.Latest,
                true,
                ts.ScriptKind.TS
            );

            const importedModules = new Set<string>();

            ts.forEachChild(sourceFile, node => {
                if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
                    const moduleSpec = node.moduleSpecifier;
                    if (moduleSpec && ts.isStringLiteral(moduleSpec)) {
                        importedModules.add(moduleSpec.text);
                    }
                }
            });

            const maxDepth = input.maxDepth || 2;
            for (const mod of importedModules) {
                await this.resolveAndCollectModule(mod, baseDir, aliases, resolvedFiles, 1, maxDepth);
            }
        }

        return {
            files: Array.from(resolvedFiles.values()),
            compilerOptions: {
                target: compilerOptions.target || ts.ScriptTarget.ES2022,
                module: compilerOptions.module || ts.ModuleKind.CommonJS,
                experimentalDecorators: compilerOptions.experimentalDecorators ?? true,
                emitDecoratorMetadata: compilerOptions.emitDecoratorMetadata ?? true,
                paths: aliases
            },
            aliases: aliases
        };
    }

    /**
     * Resolve um módulo de import (relativo, alias tsconfig ou biblioteca de node_modules)
     */
    private async resolveAndCollectModule(
        moduleSpec: string,
        baseDir: string,
        aliases: Record<string, string[]>,
        collector: Map<string, TypeScriptResourceFileDto>,
        currentDepth: number,
        maxDepth: number
    ): Promise<void> {
        if (currentDepth > maxDepth) return;

        // Caso A: Import relativo (./ ou ../)
        if (moduleSpec.startsWith('.')) {
            const directTarget = resolve(baseDir, moduleSpec).replace(/\\/g, '/');
            const candidatePaths = [
                directTarget.endsWith('.ts') || directTarget.endsWith('.d.ts') ? directTarget : null,
                `${directTarget}.ts`,
                `${directTarget}.d.ts`,
                `${directTarget}/index.ts`,
                `${directTarget}/index.d.ts`,
            ].filter(Boolean) as string[];

            for (const cand of candidatePaths) {
                if (existsSync(cand) && statSync(cand).isFile()) {
                    const added = this.addFileToResourceMap(cand, collector, 'import');
                    if (added && currentDepth < maxDepth) {
                        try {
                            const nestedContent = readFileSync(cand, 'utf-8');
                            const nestedSource = ts.createSourceFile(cand, nestedContent, ts.ScriptTarget.Latest, true);
                            const nestedDir = dirname(cand);
                            ts.forEachChild(nestedSource, n => {
                                if ((ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) && n.moduleSpecifier && ts.isStringLiteral(n.moduleSpecifier)) {
                                    if (n.moduleSpecifier.text.startsWith('.')) {
                                        this.resolveAndCollectModule(n.moduleSpecifier.text, nestedDir, aliases, collector, currentDepth + 1, maxDepth);
                                    }
                                }
                            });
                        } catch { }
                    }
                    break;
                }
            }
            return;
        }

        // Caso B: Alias definido no tsconfig.paths
        for (const [aliasPattern, targetList] of Object.entries(aliases)) {
            const patternPrefix = aliasPattern.replace(/\*$/, '');
            if (moduleSpec.startsWith(patternPrefix)) {
                const subPath = moduleSpec.substring(patternPrefix.length);
                for (const targetPattern of targetList) {
                    const cleanTargetPattern = targetPattern.replace(/\*$/, '');
                    const candidateRel = cleanTargetPattern + subPath;

                    const searchRoots = ['./', '../', '../../'];
                    for (const root of searchRoots) {
                        const candidateFull = resolve(root, candidateRel).replace(/\\/g, '/');
                        const candidates = [
                            candidateFull.endsWith('.ts') || candidateFull.endsWith('.d.ts') ? candidateFull : null,
                            `${candidateFull}.ts`,
                            `${candidateFull}.d.ts`,
                            `${candidateFull}/index.ts`,
                            `${candidateFull}/index.d.ts`,
                            `${candidateFull}/public-api.ts`,
                        ].filter(Boolean) as string[];

                        for (const c of candidates) {
                            if (existsSync(c) && statSync(c).isFile()) {
                                this.addFileToResourceMap(c, collector, 'alias');
                                return;
                            }
                        }
                    }
                }
            }
        }

        // Caso C: Pacote de node_modules (ex: @angular/core, rxjs)
        this.resolveNodeModuleTypes(moduleSpec, baseDir, collector);
    }

    /**
     * Tenta localizar a tipagem (.d.ts) de uma dependência instalada no node_modules
     */
    private resolveNodeModuleTypes(
        packageName: string,
        baseDir: string,
        collector: Map<string, TypeScriptResourceFileDto>
    ): void {
        let current = baseDir;
        for (let i = 0; i < 5; i++) {
            const nmPath = join(current, 'node_modules', packageName);
            if (existsSync(nmPath)) {
                const pkgJsonPath = join(nmPath, 'package.json');
                if (existsSync(pkgJsonPath)) {
                    try {
                        const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
                        const typesField = pkg.typings || pkg.types;
                        if (typesField) {
                            const dtsPath = resolve(nmPath, typesField).replace(/\\/g, '/');
                            if (existsSync(dtsPath)) {
                                this.addFileToResourceMap(dtsPath, collector, 'types');
                                return;
                            }
                        }
                    } catch { }
                }
                const indexDts = join(nmPath, 'index.d.ts');
                if (existsSync(indexDts)) {
                    this.addFileToResourceMap(indexDts.replace(/\\/g, '/'), collector, 'types');
                    return;
                }
            }

            // Tenta @types/
            const typesPkg = packageName.startsWith('@')
                ? packageName.substring(1).replace('/', '__')
                : packageName;
            const atTypesDts = join(current, 'node_modules', '@types', typesPkg, 'index.d.ts');
            if (existsSync(atTypesDts)) {
                this.addFileToResourceMap(atTypesDts.replace(/\\/g, '/'), collector, 'types');
                return;
            }

            const parent = dirname(current);
            if (parent === current) break;
            current = parent;
        }
    }

    /**
     * Localiza o diretório de um pacote instalado em node_modules subindo a partir do arquivo
     */
    public findInstalledPackageDir(packageName: string, referencePath?: string): string | null {
        const fullRef = this.resolveExistingPath(referencePath);
        let current = existsSync(fullRef) && statSync(fullRef).isDirectory()
            ? fullRef
            : (existsSync(fullRef) ? dirname(fullRef) : './');

        // 1. Procura subindo a árvore de diretórios
        for (let i = 0; i < 7; i++) {
            const candidate = join(current, 'node_modules', packageName);
            if (existsSync(candidate) && existsSync(join(candidate, 'package.json'))) {
                return candidate.replace(/\\/g, '/');
            }
            const parent = dirname(current);
            if (parent === current) break;
            current = parent;
        }

        // 2. Fallbacks conhecidos no repositório
        const roots = ['./apps', '../apps', './server', '../server', '.', '..'];
        for (const root of roots) {
            const candidate = join(root, 'node_modules', packageName);
            if (existsSync(candidate) && existsSync(join(candidate, 'package.json'))) {
                return candidate.replace(/\\/g, '/');
            }
        }

        return null;
    }

    /**
     * Recupera informações estruturadas de package.json e tipagens de um módulo instalado
     */
    public getInstalledPackageInfo(packageName: string, referencePath?: string): {
        packageDir: string;
        pkgJson: any;
        mainDtsPath?: string;
    } | null {
        const packageDir = this.findInstalledPackageDir(packageName, referencePath);
        if (!packageDir) return null;

        try {
            const pkgJsonPath = join(packageDir, 'package.json');
            const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));

            let mainDtsPath: string | undefined = undefined;

            // Opção 1: exports['.'].types
            if (pkgJson.exports && typeof pkgJson.exports === 'object') {
                const dotExport = pkgJson.exports['.'];
                if (dotExport && typeof dotExport === 'object' && dotExport.types) {
                    const cand = resolve(packageDir, dotExport.types).replace(/\\/g, '/');
                    if (existsSync(cand)) mainDtsPath = cand;
                }
            }

            // Opção 2: types ou typings
            if (!mainDtsPath) {
                const typesField = pkgJson.types || pkgJson.typings;
                if (typesField) {
                    const cand = resolve(packageDir, typesField).replace(/\\/g, '/');
                    if (existsSync(cand)) mainDtsPath = cand;
                }
            }

            // Opção 3: index.d.ts
            if (!mainDtsPath) {
                const indexDts = join(packageDir, 'index.d.ts').replace(/\\/g, '/');
                if (existsSync(indexDts)) mainDtsPath = indexDts;
            }

            // Opção 4: @types/
            if (!mainDtsPath) {
                const typesPkg = packageName.startsWith('@')
                    ? packageName.substring(1).replace('/', '__')
                    : packageName;
                const atTypesDts = join(dirname(dirname(packageDir)), '@types', typesPkg, 'index.d.ts').replace(/\\/g, '/');
                if (existsSync(atTypesDts)) mainDtsPath = atTypesDts;
            }

            return {
                packageDir,
                pkgJson,
                mainDtsPath
            };
        } catch {
            return null;
        }
    }

    /**
     * Extrai símbolos exportados, tipos e JSDoc de um arquivo .d.ts de pacote
     */
    public extractExportedSymbolsFromDts(
        dtsPath: string,
        maxSymbols: number = 150,
        visitedFiles: Set<string> = new Set()
    ): TypeScriptExportedSymbolDto[] {
        if (!existsSync(dtsPath) || visitedFiles.has(dtsPath)) return [];
        visitedFiles.add(dtsPath);

        const results: TypeScriptExportedSymbolDto[] = [];
        try {
            const content = readFileSync(dtsPath, 'utf-8');
            const sourceFile = ts.createSourceFile(dtsPath, content, ts.ScriptTarget.Latest, true);
            const baseDir = dirname(dtsPath);

            ts.forEachChild(sourceFile, node => {
                if (results.length >= maxSymbols) return;

                let name = '';
                let kind = '';

                if (ts.isClassDeclaration(node) && node.name) {
                    name = node.name.text;
                    kind = 'class';
                } else if (ts.isInterfaceDeclaration(node)) {
                    name = node.name.text;
                    kind = 'interface';
                } else if (ts.isFunctionDeclaration(node) && node.name) {
                    name = node.name.text;
                    kind = 'function';
                } else if (ts.isTypeAliasDeclaration(node)) {
                    name = node.name.text;
                    kind = 'type';
                } else if (ts.isEnumDeclaration(node)) {
                    name = node.name.text;
                    kind = 'enum';
                } else if (ts.isVariableStatement(node)) {
                    for (const decl of node.declarationList.declarations) {
                        if (ts.isIdentifier(decl.name)) {
                            const vName = decl.name.text;
                            if (!vName.startsWith('ɵ') && !vName.startsWith('_')) {
                                const pos = sourceFile.getLineAndCharacterOfPosition(decl.getStart());
                                results.push({
                                    name: vName,
                                    kind: 'variable',
                                    signature: this.getSignatureSnippet(node, sourceFile),
                                    documentation: this.extractJsDoc(node, sourceFile),
                                    line: pos.line + 1,
                                    column: pos.character + 1,
                                    dtsPath: dtsPath.replace(/\\/g, '/')
                                });
                            }
                        }
                    }
                    return;
                }

                if (name && !name.startsWith('ɵ') && !name.startsWith('_')) {
                    const pos = sourceFile.getLineAndCharacterOfPosition(node.getStart());
                    results.push({
                        name,
                        kind,
                        signature: this.getSignatureSnippet(node, sourceFile),
                        documentation: this.extractJsDoc(node, sourceFile),
                        line: pos.line + 1,
                        column: pos.character + 1,
                        dtsPath: dtsPath.replace(/\\/g, '/')
                    });
                }

                // Segue re-exportações relativas (ex: export { Component } from './_discovery-chunk.js')
                if (ts.isExportDeclaration(node)) {
                    const moduleSpec = node.moduleSpecifier;
                    const specText = moduleSpec && ts.isStringLiteral(moduleSpec) ? moduleSpec.text : '';

                    if (specText && specText.startsWith('.')) {
                        const targetFile = resolve(baseDir, specText.endsWith('.js') ? specText.replace(/\.js$/, '.d.ts') : specText);
                        const candidates = [
                            targetFile,
                            `${targetFile}.d.ts`,
                            `${targetFile}.ts`,
                            `${targetFile}/index.d.ts`
                        ];
                        const foundCand = candidates.find(c => existsSync(c));
                        if (foundCand && !visitedFiles.has(foundCand)) {
                            const subSymbols = this.extractExportedSymbolsFromDts(foundCand, maxSymbols - results.length, visitedFiles);
                            if (node.exportClause && ts.isNamedExports(node.exportClause)) {
                                const allowedNames = new Set(node.exportClause.elements.map(e => e.name.text));
                                for (const sub of subSymbols) {
                                    if (allowedNames.has(sub.name)) {
                                        results.push(sub);
                                    }
                                }
                            } else {
                                results.push(...subSymbols);
                            }
                        }
                    }
                }
            });
        } catch { }

        const uniqueMap = new Map<string, TypeScriptExportedSymbolDto>();
        for (const sym of results) {
            if (!uniqueMap.has(sym.name)) {
                uniqueMap.set(sym.name, sym);
            }
        }
        return Array.from(uniqueMap.values());
    }

    /**
     * Localiza a documentação JSDoc e assinatura de um símbolo em um módulo instalado
     */
    public resolveInstalledSymbolDoc(
        packageName: string,
        symbolName: string,
        referencePath?: string
    ): {
        symbolName: string;
        kind: string;
        signature: string;
        description: string;
        params?: Array<{ name: string; type?: string; description?: string }>;
        markdown: string;
        dtsPath?: string;
        line?: number;
        column?: number;
    } | null {
        const pkgInfo = this.getInstalledPackageInfo(packageName, referencePath);
        if (!pkgInfo) return null;

        const { pkgJson, mainDtsPath, packageDir } = pkgInfo;
        const version = pkgJson.version || '';
        const pkgDesc = pkgJson.description || '';
        const license = pkgJson.license || 'MIT';
        const homepage = pkgJson.homepage || (pkgJson.repository?.url ? pkgJson.repository.url.replace(/^git\+/, '').replace(/\.git$/, '') : '');

        let foundSymbol: TypeScriptExportedSymbolDto | null = null;

        if (mainDtsPath) {
            const symbols = this.extractExportedSymbolsFromDts(mainDtsPath, 350);
            foundSymbol = symbols.find(s => s.name === symbolName) || null;
        }

        if (!foundSymbol) {
            try {
                const files = readdirSync(packageDir, { withFileTypes: true });
                for (const f of files) {
                    if (f.isFile() && f.name.endsWith('.d.ts')) {
                        const candPath = join(packageDir, f.name).replace(/\\/g, '/');
                        const candSymbols = this.extractExportedSymbolsFromDts(candPath, 150);
                        foundSymbol = candSymbols.find(s => s.name === symbolName) || null;
                        if (foundSymbol) break;
                    }
                }
            } catch { }
        }

        if (!foundSymbol) {
            let md = `### 📦 \`${packageName}@${version}\`\n\n`;
            if (pkgDesc) md += `${pkgDesc}\n\n`;
            md += `**Símbolo:** \`${symbolName}\` *(recurso exportado pelo módulo)*\n\n`;
            if (license) md += `**Licença:** \`${license}\`\n\n`;
            if (homepage) md += `🔗 [Documentação Oficial / Repositório](${homepage})\n\n`;

            return {
                symbolName,
                kind: 'module-export',
                signature: `import { ${symbolName} } from '${packageName}';`,
                description: pkgDesc || `Símbolo exportado pelo módulo ${packageName}`,
                markdown: md
            };
        }

        let md = `### 📦 \`${packageName}@${version}\` · \`${foundSymbol.name}\`\n\n`;
        md += `\`\`\`typescript\n${foundSymbol.signature}\n\`\`\`\n\n`;
        md += `**Tipo:** \`${foundSymbol.kind}\` | **Módulo:** \`${packageName}\`\n\n`;

        if (foundSymbol.documentation) {
            md += `#### Descrição\n${foundSymbol.documentation}\n\n`;
        } else if (pkgDesc) {
            md += `*${pkgDesc}*\n\n`;
        }

        if (foundSymbol.dtsPath) {
            const relDts = this.toWorkspaceRelativePath(foundSymbol.dtsPath);
            md += `📄 *Declaração:* \`${relDts}\` *(Ln ${foundSymbol.line || 1})*\n\n`;
        }

        if (homepage) {
            md += `🔗 [Documentação Oficial](${homepage})\n`;
        }

        return {
            symbolName: foundSymbol.name,
            kind: foundSymbol.kind,
            signature: foundSymbol.signature,
            description: foundSymbol.documentation || pkgDesc,
            markdown: md,
            dtsPath: foundSymbol.dtsPath,
            line: foundSymbol.line,
            column: foundSymbol.column
        };
    }

    /**
     * Obtém documentação completa e visão geral de um módulo instalado
     */
    public async getPackageDocumentation(input: TypeScriptPackageDocInputDto): Promise<TypeScriptPackageDocOutputDto> {
        const packageName = input.packageName;
        const pkgInfo = this.getInstalledPackageInfo(packageName, input.filePath);

        if (!pkgInfo) {
            return {
                name: packageName,
                version: 'não instalada',
                description: `O módulo ${packageName} não foi localizado em node_modules.`,
                exportedSymbols: [],
                markdown: `### ⚠️ Módulo \`${packageName}\` não encontrado\n\nNão foi possível localizar o diretório \`node_modules/${packageName}\`.`
            };
        }

        const { packageDir, pkgJson, mainDtsPath } = pkgInfo;
        const version = pkgJson.version || '0.0.0';
        const description = pkgJson.description || '';
        const license = pkgJson.license || 'MIT';
        const homepage = pkgJson.homepage || (pkgJson.repository?.url ? pkgJson.repository.url.replace(/^git\+/, '').replace(/\.git$/, '') : '');
        const repo = typeof pkgJson.repository === 'string' ? pkgJson.repository : pkgJson.repository?.url;

        let readmeSnippet = '';
        const readmePath = join(packageDir, 'README.md');
        if (existsSync(readmePath)) {
            try {
                const fullReadme = readFileSync(readmePath, 'utf-8');
                const parts = fullReadme.split(/^## /m);
                readmeSnippet = parts.length > 1 ? parts[0].trim() : fullReadme.substring(0, 1500).trim();
            } catch { }
        }

        let exportedSymbols: TypeScriptExportedSymbolDto[] = [];
        if (mainDtsPath) {
            exportedSymbols = this.extractExportedSymbolsFromDts(mainDtsPath, 200);
        }

        let md = `## 📦 ${packageName} \`v${version}\`\n\n`;
        if (description) md += `> ${description}\n\n`;
        md += `- **Licença:** \`${license}\`\n`;
        if (homepage) md += `- **Documentação Oficial:** [${homepage}](${homepage})\n`;
        if (mainDtsPath) md += `- **Tipagem (.d.ts):** \`${this.toWorkspaceRelativePath(mainDtsPath)}\`\n`;
        md += '\n';

        if (readmeSnippet) {
            md += `### Visão Geral (README)\n${readmeSnippet}\n\n`;
        }

        if (exportedSymbols.length > 0) {
            md += `### Recursos Exportados (${exportedSymbols.length})\n\n`;
            for (const sym of exportedSymbols.slice(0, 30)) {
                md += `- **\`${sym.name}\`** (\`${sym.kind}\`): ${sym.documentation ? sym.documentation.split('\n')[0] : '*(Sem descrição)*'}\n`;
            }
            if (exportedSymbols.length > 30) {
                md += `\n*... e mais ${exportedSymbols.length - 30} recursos disponíveis neste módulo.*\n`;
            }
        }

        return {
            name: packageName,
            version,
            description,
            homepage,
            repository: repo,
            license,
            typesPath: mainDtsPath ? this.toWorkspaceRelativePath(mainDtsPath) : undefined,
            readmeSnippet,
            exportedSymbols,
            markdown: md
        };
    }

    /**
     * Lista pacotes instalados e módulos utilizados no arquivo para documentação e manutenção
     */
    public async getInstalledPackages(input: TypeScriptInstalledPackagesInputDto): Promise<TypeScriptInstalledPackagesOutputDto> {
        const targetPath = this.resolveExistingPath(input.filePath);
        let content = input.fileContent;
        if (!content && existsSync(targetPath) && statSync(targetPath).isFile()) {
            try {
                content = readFileSync(targetPath, 'utf-8');
            } catch { }
        }

        const usedPackages = new Set<string>();
        if (content) {
            const importRegex = /(?:import|export)\s+(?:[\w*\s{},]*from\s+)?['"]([^'"]+)['"]/g;
            let m: RegExpExecArray | null;
            while ((m = importRegex.exec(content)) !== null) {
                const spec = m[1];
                if (spec && !spec.startsWith('.')) {
                    const parts = spec.split('/');
                    const pkgName = spec.startsWith('@') && parts.length > 1 ? `${parts[0]}/${parts[1]}` : parts[0];
                    usedPackages.add(pkgName);
                }
            }
        }

        const packagesMap = new Map<string, TypeScriptInstalledPackageSummaryDto>();

        for (const pkgName of usedPackages) {
            const info = this.getInstalledPackageInfo(pkgName, targetPath);
            if (info) {
                packagesMap.set(pkgName, {
                    name: pkgName,
                    version: info.pkgJson.version || '',
                    description: info.pkgJson.description,
                    homepage: info.pkgJson.homepage,
                    license: info.pkgJson.license,
                    isUsedInFile: true
                });
            } else {
                packagesMap.set(pkgName, {
                    name: pkgName,
                    version: 'instalada',
                    isUsedInFile: true
                });
            }
        }

        const baseDir = existsSync(targetPath) && statSync(targetPath).isDirectory() ? targetPath : dirname(targetPath);
        let curr = baseDir;
        for (let i = 0; i < 5; i++) {
            const pjCandidate = join(curr, 'package.json');
            if (existsSync(pjCandidate)) {
                try {
                    const pj = JSON.parse(readFileSync(pjCandidate, 'utf-8'));
                    const allDeps = { ...(pj.dependencies || {}), ...(pj.devDependencies || {}) };
                    for (const dep of Object.keys(allDeps)) {
                        if (!packagesMap.has(dep)) {
                            const info = this.getInstalledPackageInfo(dep, targetPath);
                            packagesMap.set(dep, {
                                name: dep,
                                version: info?.pkgJson?.version || allDeps[dep],
                                description: info?.pkgJson?.description,
                                homepage: info?.pkgJson?.homepage,
                                license: info?.pkgJson?.license,
                                isUsedInFile: false
                            });
                        }
                    }
                    break;
                } catch { }
            }
            const p = dirname(curr);
            if (p === curr) break;
            curr = p;
        }

        return {
            packages: Array.from(packagesMap.values())
        };
    }

    private addFileToResourceMap(
        filePath: string,
        map: Map<string, TypeScriptResourceFileDto>,
        source: string
    ): boolean {
        const normalized = filePath.replace(/\\/g, '/');
        const relPath = this.toWorkspaceRelativePath(normalized);
        const virtualUri = `file:///${relPath.replace(/^\/+/, '')}`;

        if (map.has(virtualUri)) return false;

        try {
            const content = readFileSync(normalized, 'utf-8');
            map.set(virtualUri, {
                path: relPath,
                virtualUri: virtualUri,
                content: content,
                isDeclaration: normalized.endsWith('.d.ts'),
                source: source
            });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Resolve a definição de um símbolo ("Go to Definition", F12, Ctrl+Click)
     */
    public async resolveDefinition(input: TypeScriptDefinitionInputDto): Promise<TypeScriptDefinitionOutputDto> {
        const targetPath = this.resolveExistingPath(input.filePath);
        let content = input.fileContent;

        if (!content && existsSync(targetPath) && statSync(targetPath).isFile()) {
            try {
                content = readFileSync(targetPath, 'utf-8');
            } catch { }
        }

        if (!content) {
            return { found: false };
        }

        const sourceFile = ts.createSourceFile(
            targetPath,
            content,
            ts.ScriptTarget.Latest,
            true,
            ts.ScriptKind.TS
        );

        let targetSymbolName = input.symbolName;
        const line = input.line || 1;
        const column = input.column || 1;

        // Se o nome do símbolo não foi fornecido diretamente, localiza o nó da AST na posição indicada
        if (!targetSymbolName && input.line && input.column) {
            const offset = sourceFile.getPositionOfLineAndCharacter(line - 1, column - 1);
            const foundNode = this.findNodeAtOffset(sourceFile, offset);
            if (foundNode && ts.isIdentifier(foundNode)) {
                targetSymbolName = foundNode.text;
            }
        }

        if (!targetSymbolName) {
            return { found: false };
        }

        // 1. Verifica se é um símbolo importado de outro arquivo
        let importTargetModule: string | null = null;
        ts.forEachChild(sourceFile, node => {
            if (ts.isImportDeclaration(node) && node.importClause) {
                const clause = node.importClause;
                const moduleSpec = node.moduleSpecifier;
                const specText = ts.isStringLiteral(moduleSpec) ? moduleSpec.text : '';

                if (clause.name && clause.name.text === targetSymbolName) {
                    importTargetModule = specText;
                } else if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
                    for (const elem of clause.namedBindings.elements) {
                        if (elem.name.text === targetSymbolName || elem.propertyName?.text === targetSymbolName) {
                            importTargetModule = specText;
                            break;
                        }
                    }
                }
            }
        });

        // 2. Se for importado, localiza o arquivo de destino e a declaração correspondente
        if (importTargetModule) {
            // Caso seja um módulo instalado em node_modules (não relativo)
            if (!importTargetModule.startsWith('.')) {
                const installedSymbol = this.resolveInstalledSymbolDoc(importTargetModule, targetSymbolName, targetPath);
                if (installedSymbol && installedSymbol.dtsPath) {
                    return {
                        found: true,
                        targetPath: this.toWorkspaceRelativePath(installedSymbol.dtsPath),
                        targetLine: installedSymbol.line || 1,
                        targetColumn: installedSymbol.column || 1,
                        symbolName: targetSymbolName,
                        declarationSnippet: installedSymbol.signature,
                        documentation: installedSymbol.description
                    };
                }
            }

            const baseDir = dirname(targetPath);
            const tsConfig = this.getProjectTsConfig(targetPath);
            const resolvedPath = this.findModuleFilePath(importTargetModule, baseDir, tsConfig.paths || {});

            if (resolvedPath && existsSync(resolvedPath)) {
                try {
                    const destContent = readFileSync(resolvedPath, 'utf-8');
                    const destSource = ts.createSourceFile(resolvedPath, destContent, ts.ScriptTarget.Latest, true);
                    const declInfo = this.findDeclarationInSource(destSource, targetSymbolName);

                    if (declInfo) {
                        return {
                            found: true,
                            targetPath: this.toWorkspaceRelativePath(resolvedPath),
                            targetLine: declInfo.line,
                            targetColumn: declInfo.column,
                            symbolName: targetSymbolName,
                            declarationSnippet: declInfo.snippet,
                            documentation: declInfo.documentation
                        };
                    }

                    // Se não achou a declaração exata no arquivo, abre o arquivo no topo
                    return {
                        found: true,
                        targetPath: this.toWorkspaceRelativePath(resolvedPath),
                        targetLine: 1,
                        targetColumn: 1,
                        symbolName: targetSymbolName
                    };
                } catch { }
            }
        }

        // 3. Procura declaração no próprio arquivo ativo
        const localDecl = this.findDeclarationInSource(sourceFile, targetSymbolName);
        if (localDecl) {
            return {
                found: true,
                targetPath: this.toWorkspaceRelativePath(targetPath),
                targetLine: localDecl.line,
                targetColumn: localDecl.column,
                symbolName: targetSymbolName,
                declarationSnippet: localDecl.snippet,
                documentation: localDecl.documentation
            };
        }

        return { found: false, symbolName: targetSymbolName };
    }

    /**
     * Extrai documentação e comentários JSDoc de um símbolo ou posição no arquivo
     */
    public async getDocumentation(input: TypeScriptDocumentationInputDto): Promise<TypeScriptDocumentationOutputDto> {
        const targetPath = this.resolveExistingPath(input.filePath);
        let content = input.fileContent;

        if (!content && existsSync(targetPath) && statSync(targetPath).isFile()) {
            try {
                content = readFileSync(targetPath, 'utf-8');
            } catch { }
        }

        content = content || '';
        const sourceFile = ts.createSourceFile(
            targetPath,
            content,
            ts.ScriptTarget.Latest,
            true,
            ts.ScriptKind.TS
        );

        let targetNode: ts.Node | null = null;
        let symbolName = input.symbolName || '';

        if (input.line && input.column) {
            const offset = sourceFile.getPositionOfLineAndCharacter(input.line - 1, input.column - 1);
            targetNode = this.findNodeAtOffset(sourceFile, offset);
            if (targetNode) {
                if (ts.isIdentifier(targetNode) || ts.isStringLiteral(targetNode)) {
                    symbolName = targetNode.text;
                }
            }
        }

        // 1. Se o cursor estiver sobre uma string de importação de pacote ou se symbolName for um pacote instalado
        const packageDoc = this.getInstalledPackageInfo(symbolName, targetPath);
        if (packageDoc) {
            const pkgOverview = await this.getPackageDocumentation({ packageName: symbolName, filePath: targetPath });
            return {
                symbolName: symbolName,
                kind: 'module',
                signature: `import ... from '${symbolName}';`,
                description: pkgOverview.description || `Módulo instalado ${symbolName}`,
                markdown: pkgOverview.markdown
            };
        }

        // 2. Verifica se o símbolo é importado de um pacote instalado em node_modules
        let importedModuleSpec: string | null = null;
        ts.forEachChild(sourceFile, node => {
            if (ts.isImportDeclaration(node) && node.importClause) {
                const clause = node.importClause;
                const moduleSpec = node.moduleSpecifier;
                const specText = ts.isStringLiteral(moduleSpec) ? moduleSpec.text : '';

                if (clause.name && clause.name.text === symbolName) {
                    importedModuleSpec = specText;
                } else if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
                    for (const elem of clause.namedBindings.elements) {
                        if (elem.name.text === symbolName || elem.propertyName?.text === symbolName) {
                            importedModuleSpec = specText;
                            break;
                        }
                    }
                }
            }
        });

        if (importedModuleSpec && !importedModuleSpec.startsWith('.')) {
            const installedDoc = this.resolveInstalledSymbolDoc(importedModuleSpec, symbolName, targetPath);
            if (installedDoc) {
                return {
                    symbolName: installedDoc.symbolName,
                    kind: installedDoc.kind,
                    signature: installedDoc.signature,
                    description: installedDoc.description,
                    markdown: installedDoc.markdown
                };
            }
        }

        // 3. Busca o nó de declaração mais próximo no arquivo ativo
        const declNode = targetNode
            ? this.getNearestDeclaration(targetNode)
            : (symbolName ? this.findDeclarationNodeByName(sourceFile, symbolName) : null);

        if (!declNode) {
            return {
                symbolName: symbolName || 'desconhecido',
                kind: 'identifier',
                signature: symbolName,
                description: 'Nenhuma documentação JSDoc disponível para o símbolo selecionado.',
                markdown: `**${symbolName || 'Símbolo'}**\n\n*Nenhuma documentação disponível.*`
            };
        }

        const kindStr = this.getNodeKindString(declNode);
        const signature = this.getSignatureSnippet(declNode, sourceFile);
        const jsDocText = this.extractJsDoc(declNode, sourceFile);

        const params: Array<{ name: string; type?: string; description?: string }> = [];
        const tags: Array<{ tag: string; comment?: string }> = [];

        // Extrai parâmetros se for função ou método
        if ((declNode as any).parameters) {
            for (const param of (declNode as any).parameters) {
                const pName = param.name?.getText(sourceFile) || 'param';
                const pType = param.type?.getText(sourceFile) || 'any';
                params.push({ name: pName, type: pType });
            }
        }

        // Formata o Markdown enriquecido para exibição no Monaco Editor
        let markdown = `\`\`\`typescript\n${signature}\n\`\`\`\n\n`;
        markdown += `**Tipo:** \`${kindStr}\`\n\n`;

        if (jsDocText) {
            markdown += `### Descrição\n${jsDocText}\n\n`;
        } else {
            markdown += `*Sem comentários JSDoc associados.*\n\n`;
        }

        if (params.length > 0) {
            markdown += `### Parâmetros\n`;
            for (const p of params) {
                markdown += `- \`${p.name}\` (${p.type || 'any'})\n`;
            }
            markdown += `\n`;
        }

        return {
            symbolName: symbolName || (declNode as any).name?.getText(sourceFile) || 'Símbolo',
            kind: kindStr,
            signature: signature,
            description: jsDocText,
            params: params,
            tags: tags,
            markdown: markdown
        };
    }

    // --- Helpers de AST TypeScript ---

    private findNodeAtOffset(node: ts.Node, offset: number): ts.Node {
        let current: ts.Node = node;
        ts.forEachChild(node, child => {
            if (child.getStart() <= offset && child.getEnd() >= offset) {
                current = this.findNodeAtOffset(child, offset);
            }
        });
        return current;
    }

    private getNearestDeclaration(node: ts.Node): ts.Node {
        let curr: ts.Node | undefined = node;
        while (curr) {
            if (
                ts.isClassDeclaration(curr) ||
                ts.isInterfaceDeclaration(curr) ||
                ts.isMethodDeclaration(curr) ||
                ts.isPropertyDeclaration(curr) ||
                ts.isFunctionDeclaration(curr) ||
                ts.isVariableStatement(curr) ||
                ts.isTypeAliasDeclaration(curr) ||
                ts.isEnumDeclaration(curr)
            ) {
                return curr;
            }
            curr = curr.parent;
        }
        return node;
    }

    private findDeclarationNodeByName(sourceFile: ts.SourceFile, name: string): ts.Node | null {
        let match: ts.Node | null = null;
        const visit = (node: ts.Node) => {
            if (match) return;
            const nodeName = (node as any).name?.text || (node as any).name?.getText?.(sourceFile);
            if (nodeName === name) {
                match = node;
                return;
            }
            ts.forEachChild(node, visit);
        };
        visit(sourceFile);
        return match;
    }

    private findDeclarationInSource(sourceFile: ts.SourceFile, name: string): {
        line: number;
        column: number;
        snippet: string;
        documentation: string;
    } | null {
        const decl = this.findDeclarationNodeByName(sourceFile, name);
        if (!decl) return null;

        const pos = sourceFile.getLineAndCharacterOfPosition(decl.getStart());
        const snippet = this.getSignatureSnippet(decl, sourceFile);
        const doc = this.extractJsDoc(decl, sourceFile);

        return {
            line: pos.line + 1,
            column: pos.character + 1,
            snippet: snippet,
            documentation: doc
        };
    }

    private extractJsDoc(node: ts.Node, sourceFile: ts.SourceFile): string {
        const fullText = sourceFile.getFullText();
        const leadingComments = ts.getLeadingCommentRanges(fullText, node.getFullStart());
        let result = '';

        if (leadingComments) {
            for (const c of leadingComments) {
                const text = fullText.substring(c.pos, c.end).trim();
                if (text.startsWith('/**')) {
                    // Limpa os delimitadores de JSDoc e preserva o texto limpo
                    const cleaned = text
                        .replace(/^\/\*\*|\*\/$/g, '')
                        .split('\n')
                        .map(l => l.replace(/^\s*\*\s?/, '').trim())
                        .join('\n')
                        .trim();
                    result += cleaned + '\n';
                }
            }
        }

        return result.trim();
    }

    private getSignatureSnippet(node: ts.Node, sourceFile: ts.SourceFile): string {
        const text = node.getText(sourceFile);
        const firstLines = text.split('\n').slice(0, 4).join('\n');
        // Corta o corpo da função/classe se houver abertura de chaves
        const braceIdx = firstLines.indexOf('{');
        if (braceIdx > -1) {
            return firstLines.substring(0, braceIdx).trim();
        }
        return firstLines.trim();
    }

    private getNodeKindString(node: ts.Node): string {
        if (ts.isClassDeclaration(node)) return 'class';
        if (ts.isInterfaceDeclaration(node)) return 'interface';
        if (ts.isMethodDeclaration(node)) return 'method';
        if (ts.isPropertyDeclaration(node)) return 'property';
        if (ts.isFunctionDeclaration(node)) return 'function';
        if (ts.isTypeAliasDeclaration(node)) return 'type';
        if (ts.isEnumDeclaration(node)) return 'enum';
        if (ts.isVariableDeclaration(node) || ts.isVariableStatement(node)) return 'variable';
        return 'symbol';
    }

    private findModuleFilePath(
        moduleSpec: string,
        baseDir: string,
        aliases: Record<string, string[]>
    ): string | null {
        if (moduleSpec.startsWith('.')) {
            const target = resolve(baseDir, moduleSpec).replace(/\\/g, '/');
            const candidates = [
                target.endsWith('.ts') || target.endsWith('.d.ts') ? target : null,
                `${target}.ts`,
                `${target}.d.ts`,
                `${target}/index.ts`,
                `${target}/index.d.ts`,
            ].filter(Boolean) as string[];

            for (const c of candidates) {
                if (existsSync(c) && statSync(c).isFile()) return c;
            }
        }

        for (const [aliasPattern, targetList] of Object.entries(aliases)) {
            const patternPrefix = aliasPattern.replace(/\*$/, '');
            if (moduleSpec.startsWith(patternPrefix)) {
                const subPath = moduleSpec.substring(patternPrefix.length);
                for (const targetPattern of targetList) {
                    const cleanTargetPattern = targetPattern.replace(/\*$/, '');
                    const candidateRel = cleanTargetPattern + subPath;

                    for (const root of ['./', '../', '../../']) {
                        const candidateFull = resolve(root, candidateRel).replace(/\\/g, '/');
                        const candidates = [
                            candidateFull.endsWith('.ts') || candidateFull.endsWith('.d.ts') ? candidateFull : null,
                            `${candidateFull}.ts`,
                            `${candidateFull}.d.ts`,
                            `${candidateFull}/index.ts`,
                            `${candidateFull}/index.d.ts`,
                            `${candidateFull}/public-api.ts`,
                        ].filter(Boolean) as string[];

                        for (const c of candidates) {
                            if (existsSync(c) && statSync(c).isFile()) return c;
                        }
                    }
                }
            }
        }

        return null;
    }
}