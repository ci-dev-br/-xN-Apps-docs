import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, Observable, of } from 'rxjs';
import { ApiConfiguration, FileExplorerService, ReadDirectoryOutput } from '@ci/portal-api';
import { NuMonacoEditorModel } from '@ng-util/monaco-editor';

export interface ProjectFile {
  path: string;    // Ex: 'src/app/services/auth.service.ts'
  content: string; // Conteúdo do arquivo de código
}

export interface MonorepoTsConfigInfo {
  scope: 'apps' | 'server' | 'workspace' | 'root';
  rootPrefix: string;
  baseUrl: string;
  paths: Record<string, string[]>;
}

export type FileOpenerCallback = (filePath: string, selectionOrPosition?: any) => Promise<boolean> | boolean;

declare const monaco: any;

@Injectable({
  providedIn: 'root'
})
export class MonacoWorkspaceService {
  // Modelos carregados na memória do Monaco
  private loadedModels = new Map<string, any>();
  // Bibliotecas extras / tipagens injetadas no compilador TypeScript
  private loadedLibs = new Map<string, any>();
  private configuredCompiler = false;
  private openerDisposable?: any;
  private languageProvidersRegistered = false;

  // Cache das configurações tsconfig do monorepo (service e apps)
  private configsCache?: MonorepoTsConfigInfo[];
  private monacoCompilerPathsCache?: Record<string, string[]>;

  constructor(
    private readonly fileExplorer: FileExplorerService,
    private readonly http: HttpClient,
    private readonly apiConfig: ApiConfiguration,
  ) { }

  private get apiUrl(): string {
    return this.apiConfig.rootUrl || '';
  }

  /**
   * Configura o compilador TypeScript e opções de diagnóstico do Monaco
   */
  public setupTypeScript(monacoInstance: any = (typeof monaco !== 'undefined' ? monaco : null)): void {
    if (!monacoInstance?.languages?.typescript) return;

    const tsDefaults = monacoInstance.languages.typescript.typescriptDefaults;

    // Habilita sincronização antecipada de todos os modelos com o worker TypeScript
    // Essencial para que F12 (Go to Definition) funcione entre arquivos distintos
    tsDefaults.setEagerModelSync(true);

    tsDefaults.setCompilerOptions({
      target: monacoInstance.languages.typescript.ScriptTarget.ES2022,
      module: monacoInstance.languages.typescript.ModuleKind.CommonJS,
      moduleResolution: monacoInstance.languages.typescript.ModuleResolutionKind.NodeJs,
      allowNonTsExtensions: true,
      allowJs: true,
      noEmit: true,
      esModuleInterop: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      jsx: monacoInstance.languages.typescript.JsxEmit.React,
      baseUrl: 'file:///',
      typeRoots: ['node_modules/@types']
    });

    tsDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    if (!this.configuredCompiler) {
      this.injectCoreAmbientDeclarations(monacoInstance);
      this.ensureTsConfigInitialized(monacoInstance).catch(err => console.warn('Erro ao carregar tsconfigs iniciais:', err));
      this.configuredCompiler = true;
    }

    if (!this.languageProvidersRegistered) {
      this.registerLanguageProviders(monacoInstance);
      this.languageProvidersRegistered = true;
    }
  }

  /**
   * Faz o parse seguro de arquivos JSONC (com suporte a comentários e vírgulas finais)
   */
  private parseJsonc(content: string): any {
    try {
      const withoutComments = content.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '$1');
      const withoutTrailingCommas = withoutComments.replace(/,(\s*[}\]])/g, '$1');
      return JSON.parse(withoutTrailingCommas);
    } catch (e) {
      console.warn('Falha ao fazer parse de tsconfig JSONC:', e);
      return null;
    }
  }

  /**
   * Lê todos os tsconfig.json relevantes do monorepo (server/libs para services, apps/projects para apps, workspace e root)
   */
  public async loadAllTsConfigs(): Promise<MonorepoTsConfigInfo[]> {
    if (this.configsCache) {
      return this.configsCache;
    }

    const configsToLoad: { path: string; scope: 'server' | 'apps' | 'workspace' | 'root'; rootPrefix: string }[] = [
      { path: 'server/tsconfig.json', scope: 'server', rootPrefix: 'server' },
      { path: 'apps/tsconfig.json', scope: 'apps', rootPrefix: 'apps' },
      { path: 'workspace/tsconfig.json', scope: 'workspace', rootPrefix: 'workspace' },
      { path: 'tsconfig.json', scope: 'root', rootPrefix: '' },
    ];

    const result: MonorepoTsConfigInfo[] = [];

    for (const item of configsToLoad) {
      try {
        const fileLoaded = await lastValueFrom(
          this.fileExplorer.readFile({ body: { path: item.path } })
        );
        if (fileLoaded?.data && typeof fileLoaded.data === 'string') {
          const parsed = this.parseJsonc(fileLoaded.data);
          if (parsed?.compilerOptions) {
            const compilerOptions = parsed.compilerOptions;
            const baseUrl = compilerOptions.baseUrl || '.';
            const paths = compilerOptions.paths || {};

            result.push({
              scope: item.scope,
              rootPrefix: item.rootPrefix,
              baseUrl,
              paths
            });
          }
        }
      } catch {
        // Silencioso se algum tsconfig opcional não existir
      }
    }

    this.configsCache = result;
    return result;
  }

  /**
   * Gera o mapa consolidado de paths para o compilador do Monaco
   * associando cada alias às localizações de arquivo com baseUrl "file:///"
   */
  public async getMonacoCompilerPaths(): Promise<Record<string, string[]>> {
    if (this.monacoCompilerPathsCache) {
      return this.monacoCompilerPathsCache;
    }

    const configs = await this.loadAllTsConfigs();
    const mergedPaths: Record<string, string[]> = {};

    for (const config of configs) {
      for (const [alias, targets] of Object.entries(config.paths)) {
        if (!mergedPaths[alias]) {
          mergedPaths[alias] = [];
        }

        for (const target of targets) {
          const cleanTarget = target.replace(/^\.\//, '');
          const withPrefix = config.rootPrefix ? `${config.rootPrefix}/${cleanTarget}` : cleanTarget;

          if (!mergedPaths[alias].includes(withPrefix)) {
            mergedPaths[alias].push(withPrefix);
          }
          if (config.rootPrefix && !mergedPaths[alias].includes(cleanTarget)) {
            mergedPaths[alias].push(cleanTarget);
          }
        }
      }
    }

    this.monacoCompilerPathsCache = mergedPaths;
    return mergedPaths;
  }

  /**
   * Garante que o compilador do Monaco receba as regras consolidadas de tsconfig de service e apps
   */
  public async ensureTsConfigInitialized(monacoInstance: any = (typeof monaco !== 'undefined' ? monaco : null)): Promise<void> {
    if (!monacoInstance?.languages?.typescript) return;

    try {
      const monacoPaths = await this.getMonacoCompilerPaths();
      const tsDefaults = monacoInstance.languages.typescript.typescriptDefaults;
      const currentOptions = tsDefaults.getCompilerOptions() || {};

      tsDefaults.setCompilerOptions({
        ...currentOptions,
        baseUrl: 'file:///',
        paths: {
          ...(currentOptions.paths || {}),
          ...monacoPaths
        }
      });
    } catch (e) {
      console.warn('Erro ao inicializar tsconfig no Monaco:', e);
    }
  }

  /**
   * Lê os caminhos consolidados de tsconfig para compatibilidade
   */
  public async getTsConfigPaths(): Promise<{ baseUrl: string, paths: Record<string, string[]> }> {
    const paths = await this.getMonacoCompilerPaths();
    return { baseUrl: '.', paths };
  }

  /**
   * Resolve o caminho físico de um módulo TypeScript considerando imports relativos,
   * contexto do arquivo ativo (service vs apps) e mapeamentos dos tsconfigs
   */
  public async resolveTsModulePath(importSource: string, currentFilePath?: string): Promise<string | null> {
    if (!importSource) return null;

    // 1. Caminhos relativos
    if (importSource.startsWith('.')) {
      if (!currentFilePath) return null;
      const cleanCurrent = currentFilePath.replace(/\\/g, '/');
      const lastSlash = cleanCurrent.lastIndexOf('/');
      const baseDir = lastSlash > -1 ? cleanCurrent.substring(0, lastSlash) : '';
      return await this.findResolvedPath(baseDir, importSource);
    }

    // 2. Determina o escopo prioritário a partir do arquivo ativo
    const cleanCurrent = (currentFilePath || '').replace(/\\/g, '/').toLowerCase();
    let priorityScope: 'server' | 'apps' | 'workspace' | 'root' = 'apps';
    if (cleanCurrent.includes('/server/') || cleanCurrent.startsWith('server/') || cleanCurrent.includes('libs/')) {
      priorityScope = 'server';
    } else if (cleanCurrent.includes('/workspace/') || cleanCurrent.startsWith('workspace/')) {
      priorityScope = 'workspace';
    }

    const configs = await this.loadAllTsConfigs();
    // Ordena colocando a configuração do escopo prioritário primeiro
    const sortedConfigs = [...configs].sort((a, b) => {
      if (a.scope === priorityScope) return -1;
      if (b.scope === priorityScope) return 1;
      return 0;
    });

    for (const config of sortedConfigs) {
      // 2.1 Correspondência exata no tsconfig
      if (config.paths[importSource] && Array.isArray(config.paths[importSource])) {
        for (const target of config.paths[importSource]) {
          const cleanTarget = target.replace(/^\.\//, '');
          const candidates = [
            config.rootPrefix ? `${config.rootPrefix}/${cleanTarget}` : null,
            cleanTarget,
            config.baseUrl && config.baseUrl !== '.' && config.baseUrl !== './'
              ? `${config.rootPrefix ? config.rootPrefix + '/' : ''}${config.baseUrl.replace(/^\.\//, '')}/${cleanTarget}`
              : null
          ].filter(Boolean) as string[];

          for (const cand of candidates) {
            const resolved = await this.findResolvedPath('', cand);
            if (resolved) return resolved;
          }
        }
      }

      // 2.2 Correspondência com curingas (wildcards como @ci/core/* ou @ci-apps/*)
      for (const [pattern, targets] of Object.entries(config.paths)) {
        if (pattern.endsWith('/*') && importSource.startsWith(pattern.slice(0, -2))) {
          const sub = importSource.substring(pattern.length - 2);
          for (const target of targets) {
            const targetBase = target.replace(/\/\*$/, '').replace(/^\.\//, '');
            const candidates = [
              config.rootPrefix ? `${config.rootPrefix}/${targetBase}/${sub}` : null,
              `${targetBase}/${sub}`,
            ].filter(Boolean) as string[];

            for (const cand of candidates) {
              const resolved = await this.findResolvedPath('', cand);
              if (resolved) return resolved;
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * Carrega o conteúdo de um módulo TypeScript local referenciado
   */
  public async loadTsModuleContent(importSource: string, currentFilePath?: string): Promise<{ path: string, content: string } | null> {
    const resolvedPath = await this.resolveTsModulePath(importSource, currentFilePath);
    if (!resolvedPath) return null;

    try {
      const fileLoaded = await lastValueFrom(
        this.fileExplorer.readFile({ body: { path: resolvedPath } })
      );
      if (fileLoaded?.data && typeof fileLoaded.data === 'string') {
        return { path: resolvedPath, content: fileLoaded.data };
      }
    } catch { }

    return null;
  }

  /**
   * Registra o manipulador de abertura de arquivos para "Go to Definition" (F12 / Ctrl+Click)
   * Permite que ao navegar para um símbolo em outro arquivo, o Codex abra o arquivo correto e posicione o cursor.
   */
  public registerDefinitionOpener(
    onOpen: FileOpenerCallback,
    monacoInstance: any = (typeof monaco !== 'undefined' ? monaco : null)
  ): void {
    if (!monacoInstance?.editor?.registerEditorOpener) return;

    if (this.openerDisposable) {
      try {
        this.openerDisposable.dispose();
      } catch { }
    }

    this.openerDisposable = monacoInstance.editor.registerEditorOpener({
      openCodeEditor: async (source: any, resource: any, selectionOrPosition?: any) => {
        if (!resource) return false;

        let targetPath: string = resource.path || resource.fsPath || '';

        // Se for no formato Windows /c:/... normaliza para c:/...
        if (/^\/[a-zA-Z]:/.test(targetPath)) {
          targetPath = targetPath.substring(1);
        } else {
          targetPath = targetPath.replace(/^\/+/, '');
        }

        // Remove prefixo de raiz de repositório caso venha no path absoluto
        const normalizedLower = targetPath.toLowerCase().replace(/\\/g, '/');
        const repoMarker = 'br.dev.ci.apps/';
        const markerIdx = normalizedLower.indexOf(repoMarker);
        if (markerIdx > -1) {
          targetPath = targetPath.substring(markerIdx + repoMarker.length);
        }

        // Se o recurso for o próprio arquivo ativo, deixa o Monaco navegar internamente
        const currentUri = source?.getModel?.()?.uri?.toString();
        if (currentUri && currentUri === resource.toString()) {
          return false;
        }

        return await onOpen(targetPath, selectionOrPosition);
      }
    });
  }

  /**
   * Registra provedores de linguagem adicionais para TypeScript e JavaScript:
   * 1. Go to Definition em caminhos de importação relativa e bibliotecas internas (service e apps)
   * 2. Hover com tooltip detalhado sobre o módulo e status no FileExplorer
   */
  private registerLanguageProviders(monacoInstance: any): void {
    if (!monacoInstance?.languages) return;

    const languages = ['typescript', 'javascript'];

    // 1. Definition Provider (Resolução AST do Backend + fallback de caminhos tsconfig)
    monacoInstance.languages.registerDefinitionProvider(languages, {
      provideDefinition: async (model: any, position: any) => {
        const line = position.lineNumber;
        const col = position.column;
        const wordInfo = model.getWordAtPosition(position);
        const word = wordInfo?.word;
        const lineContent: string = model.getLineContent(line);
        const currentFilePath = model.uri.fsPath || model.uri.path;

        // 1.1 Consulta o backend Codex /typescript/definition
        try {
          const defRes: any = await lastValueFrom(
            this.http.post(`${this.apiUrl}/Codex/typescript/definition`, {
              filePath: currentFilePath,
              fileContent: model.getValue(),
              line: line,
              column: col,
              symbolName: word
            })
          );

          if (defRes?.found && defRes.targetPath) {
            let targetClean = defRes.targetPath.replace(/\\/g, '/');
            if (/^\/[a-zA-Z]:/.test(targetClean)) {
              targetClean = targetClean.substring(1);
            } else {
              targetClean = targetClean.replace(/^\/+/, '');
            }

            const normalizedLower = targetClean.toLowerCase();
            const repoMarker = 'br.dev.ci.apps/';
            const markerIdx = normalizedLower.indexOf(repoMarker);
            if (markerIdx > -1) {
              targetClean = targetClean.substring(markerIdx + repoMarker.length);
            }

            const targetLine = defRes.targetLine || 1;
            const targetCol = defRes.targetColumn || 1;
            return {
              uri: monacoInstance.Uri.parse(`file:///${targetClean}`),
              range: {
                startLineNumber: targetLine,
                startColumn: targetCol,
                endLineNumber: targetLine,
                endColumn: targetCol
              }
            };
          }
        } catch { }

        // 1.2 Resolução direta de caminhos de importação (relativos ou bibliotecas internas)
        const match = /['"]([^'"]+)['"]/.exec(lineContent);
        if (match) {
          const importPath = match[1];
          const startCol = match.index + 2;
          const endCol = startCol + importPath.length;

          if (col >= startCol && col <= endCol) {
            const resolved = await this.resolveTsModulePath(importPath, currentFilePath);
            if (resolved) {
              const cleanUri = resolved.startsWith('/') ? resolved : `/${resolved}`;
              return {
                uri: monacoInstance.Uri.parse(`file:///${cleanUri.replace(/^\/+/, '')}`),
                range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 }
              };
            }
          }
        }

        // 1.3 Se o cursor estiver sobre um símbolo importado na linha (ex: import { AuthService } from '@ci/auth')
        if (word && lineContent.includes('from')) {
          const fromMatch = /from\s+['"]([^'"]+)['"]/.exec(lineContent);
          if (fromMatch) {
            const importPath = fromMatch[1];
            const resolved = await this.resolveTsModulePath(importPath, currentFilePath);
            if (resolved) {
              const cleanUri = resolved.startsWith('/') ? resolved : `/${resolved}`;
              return {
                uri: monacoInstance.Uri.parse(`file:///${cleanUri.replace(/^\/+/, '')}`),
                range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 }
              };
            }
          }
        }

        return null;
      }
    });

    // 2. Hover Provider (Documentação avançada e identificação clara de bibliotecas service e apps)
    monacoInstance.languages.registerHoverProvider(languages, {
      provideHover: async (model: any, position: any) => {
        const line = position.lineNumber;
        const col = position.column;
        const wordInfo = model.getWordAtPosition(position);
        const word = wordInfo?.word;
        const lineContent: string = model.getLineContent(line);
        const currentFilePath = model.uri.fsPath || model.uri.path;

        // 2.1 Consulta documentação e JSDoc via backend Codex /typescript/documentation
        if (word) {
          try {
            const docRes: any = await lastValueFrom(
              this.http.post(`${this.apiUrl}/Codex/typescript/documentation`, {
                filePath: currentFilePath,
                fileContent: model.getValue(),
                line: line,
                column: col,
                symbolName: word
              })
            );

            if (docRes?.markdown && docRes.description) {
              return {
                range: {
                  startLineNumber: line,
                  startColumn: wordInfo.startColumn,
                  endLineNumber: line,
                  endColumn: wordInfo.endColumn
                },
                contents: [
                  { value: docRes.markdown }
                ]
              };
            }
          } catch { }
        }

        // 2.2 Hover sobre módulos importados (identifica se é Service ou App)
        const match = /['"]([^'"]+)['"]/.exec(lineContent);
        if (match) {
          const importPath = match[1];
          const startCol = match.index + 2;
          const endCol = startCol + importPath.length;

          if (col >= startCol && col <= endCol) {
            const resolved = await this.resolveTsModulePath(importPath, currentFilePath);
            if (resolved) {
              const isService = resolved.includes('server/') || resolved.includes('libs/');
              const isApp = resolved.includes('apps/') || resolved.includes('projects/');
              const category = isService ? 'Serviço Backend (Service)' : (isApp ? 'Biblioteca Frontend (App)' : 'Biblioteca Interna');

              return {
                range: {
                  startLineNumber: line,
                  startColumn: startCol,
                  endLineNumber: line,
                  endColumn: endCol
                },
                contents: [
                  { value: `**${category}:** \`${importPath}\`` },
                  {
                    value: `*Arquivo de Origem:* \`${resolved}\`\n\n*(Pressione **F12** ou **Ctrl+Click** para ir para a definição)*`
                  }
                ]
              };
            }

            // Fallback para documentação de pacotes em node_modules
            if (!importPath.startsWith('.')) {
              try {
                const pkgDoc: any = await this.getPackageDocumentation(importPath, currentFilePath);
                if (pkgDoc?.markdown) {
                  return {
                    range: {
                      startLineNumber: line,
                      startColumn: startCol,
                      endLineNumber: line,
                      endColumn: endCol
                    },
                    contents: [
                      { value: pkgDoc.markdown }
                    ]
                  };
                }
              } catch { }
            }
          }
        }

        return null;
      }
    });
  }

  /**
   * Obtém documentação completa de um módulo/pacote instalado via API Codex
   */
  public async getPackageDocumentation(packageName: string, filePath?: string | null): Promise<any> {
    try {
      return await lastValueFrom(
        this.http.post(`${this.apiUrl}/Codex/typescript/package-doc`, {
          packageName,
          filePath: filePath || undefined
        })
      );
    } catch (e) {
      console.warn(`Erro ao carregar documentação do pacote ${packageName}:`, e);
      return null;
    }
  }

  /**
   * Lista pacotes instalados e módulos utilizados no arquivo para suporte à manutenção
   */
  public async getInstalledPackages(filePath?: string | null, fileContent?: string): Promise<any> {
    try {
      return await lastValueFrom(
        this.http.post(`${this.apiUrl}/Codex/typescript/installed-packages`, {
          filePath: filePath || undefined,
          fileContent
        })
      );
    } catch (e) {
      console.warn('Erro ao listar pacotes instalados:', e);
      return { packages: [] };
    }
  }

  /**
   * Procura o arquivo correspondente a um import no FileExplorer
   * Suporta extensões .ts, .d.ts, /index.ts, /public-api.ts
   */
  public async findResolvedPath(baseDir: string, relativePath: string): Promise<string | null> {
    const resolvedPath = baseDir ? this.resolvePath(baseDir, relativePath) : relativePath;
    const cleanPath = resolvedPath.replace(/^\.\//, '');

    const candidates = [
      cleanPath.endsWith('.ts') || cleanPath.endsWith('.d.ts') ? cleanPath : null,
      `${cleanPath}.ts`,
      `${cleanPath}.d.ts`,
      `${cleanPath}/index.ts`,
      `${cleanPath}/index.d.ts`,
      `${cleanPath}/public-api.ts`,
      `${cleanPath}/public-api.d.ts`,
      `${cleanPath}.js`,
      `${cleanPath}.json`,
    ].filter(Boolean) as string[];

    for (const candidate of candidates) {
      const virtualUri = `file:///${candidate.replace(/^\/+/, '')}`;
      if (this.loadedLibs.has(virtualUri) || this.loadedModels.has(virtualUri)) {
        return candidate;
      }

      try {
        const fileLoaded = await lastValueFrom(
          this.fileExplorer.readFile({ body: { path: candidate } })
        );
        if (fileLoaded?.data) {
          return candidate;
        }
      } catch { }
    }

    return null;
  }

  /**
   * Injeta declarações básicas e ambient types de ecossistemas comuns (Angular, RxJS)
   */
  private injectCoreAmbientDeclarations(monacoInstance: any): void {
    const angularCoreDts = `
      declare module '@angular/core' {
        export interface Type<T> extends Function { new (...args: any[]): T; }
        export declare function Component(obj: any): ClassDecorator;
        export declare function Directive(obj: any): ClassDecorator;
        export declare function Pipe(obj: any): ClassDecorator;
        export declare function Injectable(obj?: any): ClassDecorator;
        export declare function NgModule(obj: any): ClassDecorator;
        export declare function Input(bindingPropertyName?: string | any): any;
        export declare function Output(bindingPropertyName?: string): any;
        export declare function ViewChild(selector: any, opts?: any): any;
        export declare function ViewChildren(selector: any, opts?: any): any;
        export declare function ContentChild(selector: any, opts?: any): any;
        export declare function ContentChildren(selector: any, opts?: any): any;
        export declare function HostListener(eventName: string, args?: string[]): any;
        export declare function HostBinding(hostPropertyName?: string): any;
        export declare function Inject(token: any): ParameterDecorator;
        export declare function Optional(): ParameterDecorator;
        export declare function Self(): ParameterDecorator;
        export declare function SkipSelf(): ParameterDecorator;
        export declare function Host(): ParameterDecorator;
        export interface OnInit { ngOnInit(): void; }
        export interface OnDestroy { ngOnDestroy(): void; }
        export interface OnChanges { ngOnChanges(changes: any): void; }
        export interface AfterViewInit { ngAfterViewInit(): void; }
        export class ElementRef<T = any> { nativeElement: T; constructor(nativeElement: T); }
        export class TemplateRef<C = any> { elementRef: ElementRef; }
        export class ViewContainerRef { clear(): void; }
        export class ChangeDetectorRef { markForCheck(): void; detectChanges(): void; }
        export class EventEmitter<T = any> { emit(value?: T): void; subscribe(generatorOrNext?: any): any; }
      }
    `;

    const rxjsDts = `
      declare module 'rxjs' {
        export class Observable<T = any> {
          subscribe(observer?: any): any;
          pipe(...operations: any[]): Observable<any>;
        }
        export class Subject<T = any> extends Observable<T> {
          next(value: T): void;
          error(err: any): void;
          complete(): void;
        }
        export class BehaviorSubject<T = any> extends Subject<T> {
          constructor(initialValue: T);
          getValue(): T;
          readonly value: T;
        }
        export class Subscription {
          unsubscribe(): void;
          add(teardown: any): void;
        }
        export function of<T>(...args: T[]): Observable<T>;
        export function from<T>(input: any): Observable<T>;
        export function lastValueFrom<T>(observable: Observable<T>): Promise<T>;
        export function firstValueFrom<T>(observable: Observable<T>): Promise<T>;
      }
      declare module 'rxjs/operators' {
        export function map(fn: (val: any, index?: number) => any): any;
        export function filter(fn: (val: any, index?: number) => boolean): any;
        export function tap(fn: any): any;
        export function switchMap(fn: (val: any) => any): any;
        export function catchError(fn: (err: any) => any): any;
        export function takeUntil(notifier: any): any;
        export function debounceTime(dueTime: number): any;
      }
    `;

    this.addExtraLib(angularCoreDts, 'file:///node_modules/@angular/core/index.d.ts', monacoInstance);
    this.addExtraLib(rxjsDts, 'file:///node_modules/rxjs/index.d.ts', monacoInstance);
  }

  /**
   * Registra ou atualiza uma biblioteca extra no compilador TypeScript do Monaco
   */
  public addExtraLib(content: string, uri: string, monacoInstance: any = (typeof monaco !== 'undefined' ? monaco : null)): void {
    if (!monacoInstance?.languages?.typescript) return;
    const tsDefaults = monacoInstance.languages.typescript.typescriptDefaults;

    const normalizedUri = uri.startsWith('file:///') ? uri : `file:///${uri.replace(/^\/+/, '')}`;

    if (this.loadedLibs.has(normalizedUri)) {
      const existing = this.loadedLibs.get(normalizedUri);
      if (existing?.content === content) {
        return; // Já está carregado com o mesmo conteúdo
      }
      try {
        existing?.disposable?.dispose?.();
      } catch (e) {
        console.warn('Erro ao liberar biblioteca extra anterior:', e);
      }
    }

    try {
      const disposable = tsDefaults.addExtraLib(content, normalizedUri);
      this.loadedLibs.set(normalizedUri, { disposable, content });
    } catch (err) {
      console.warn('Falha ao adicionar extraLib no Monaco:', normalizedUri, err);
    }
  }

  /**
   * Adiciona um arquivo ao Monaco: se for .ts/.js, registra como Model no Editor (necessário para F12 funcionar)
   * e como extraLib no compilador TypeScript. Se for .d.ts, registra como extraLib.
   */
  public addModelOrExtraLib(
    content: string,
    uri: string,
    monacoInstance: any = (typeof monaco !== 'undefined' ? monaco : null)
  ): void {
    if (!monacoInstance) return;

    const normalizedUri = uri.startsWith('file:///') ? uri : `file:///${uri.replace(/^\/+/, '')}`;

    if (normalizedUri.endsWith('.d.ts')) {
      this.addExtraLib(content, normalizedUri, monacoInstance);
    } else {
      if (monacoInstance.editor) {
        try {
          const fileUri = monacoInstance.Uri.parse(normalizedUri);
          let existingModel = monacoInstance.editor.getModel(fileUri);
          if (!existingModel) {
            existingModel = monacoInstance.editor.createModel(content, 'typescript', fileUri);
            this.loadedModels.set(fileUri.toString(), existingModel);
          } else {
            if (existingModel.getValue() !== content) {
              existingModel.setValue(content);
            }
          }
        } catch (e) {
          console.warn('Erro ao criar modelo para arquivo no Monaco:', normalizedUri, e);
        }
      }
      this.addExtraLib(content, normalizedUri, monacoInstance);
    }
  }

  /**
   * Consome os tsconfigs e o FileExplorerService para carregar recursos avançados,
   * arquivos irmãos e resolver dependências de import do arquivo carregado (service e apps)
   */
  public async carregarRecursosArquivo(
    filePath: string,
    fileContent: string,
    monacoInstance: any = (typeof monaco !== 'undefined' ? monaco : null)
  ): Promise<void> {
    if (!filePath || !monacoInstance) return;

    this.setupTypeScript(monacoInstance);
    await this.ensureTsConfigInitialized(monacoInstance);

    // 1. Carrega recursos avançados de TypeScript via endpoints do Backend Codex
    await this.carregarRecursosAvancadosBackend(filePath, fileContent, monacoInstance);

    const normalizedPath = filePath.replace(/\\/g, '/');
    const lastSlash = normalizedPath.lastIndexOf('/');
    const dir = lastSlash > -1 ? normalizedPath.substring(0, lastSlash) : '';

    // 2. Carrega arquivos irmãos no mesmo diretório
    if (dir) {
      await this.carregarArquivosIrmaos(dir, normalizedPath, monacoInstance);
    }

    // 3. Resolve todos os imports do arquivo (tanto relativos quanto bibliotecas internas de service e apps)
    if (fileContent) {
      await this.resolverTodosImports(normalizedPath, fileContent, monacoInstance);
    }
  }

  /**
   * Consome o endpoint /Codex/typescript/resources para alimentar o Monaco com arquivos de declaração,
   * módulos e opções de compilador do projeto
   */
  public async carregarRecursosAvancadosBackend(
    filePath: string,
    fileContent: string,
    monacoInstance: any
  ): Promise<boolean> {
    try {
      const url = `${this.apiUrl}/Codex/typescript/resources`;
      const res: any = await lastValueFrom(
        this.http.post(url, {
          filePath,
          fileContent,
          maxDepth: 3
        })
      );

      if (res?.files && Array.isArray(res.files)) {
        for (const file of res.files) {
          if (file.virtualUri && file.content) {
            this.addModelOrExtraLib(file.content, file.virtualUri, monacoInstance);
          }
        }
      }

      if (res?.compilerOptions && monacoInstance?.languages?.typescript) {
        const tsDefaults = monacoInstance.languages.typescript.typescriptDefaults;
        const currentOptions = tsDefaults.getCompilerOptions() || {};
        tsDefaults.setCompilerOptions({
          ...currentOptions,
          paths: {
            ...(currentOptions.paths || {}),
            ...(res.compilerOptions.paths || {})
          },
        });
      }

      return true;
    } catch (err) {
      console.warn('Backend Codex /typescript/resources não disponível ou falhou:', err);
      return false;
    }
  }

  /**
   * Lê o diretório do arquivo ativo e injeta arquivos .ts/.d.ts como bibliotecas extras no Monaco
   */
  private async carregarArquivosIrmaos(
    directoryPath: string,
    currentFilePath: string,
    monacoInstance: any
  ): Promise<void> {
    try {
      const items: ReadDirectoryOutput[] = await lastValueFrom(
        this.fileExplorer.readDirectory({ body: { path: directoryPath } })
      );

      if (!items || !Array.isArray(items)) return;

      for (const item of items) {
        if (!item.name || item.isDirectory) continue;

        const isTs = item.name.endsWith('.ts') || item.name.endsWith('.d.ts');
        if (!isTs) continue;

        const itemFullPath = item.path || `${directoryPath}/${item.name}`;
        if (itemFullPath === currentFilePath) continue;

        try {
          const loadedFile = await lastValueFrom(
            this.fileExplorer.readFile({ body: { path: itemFullPath } })
          );

          if (loadedFile?.data && typeof loadedFile.data === 'string') {
            const virtualUri = `file:///${itemFullPath.replace(/^\/+/, '')}`;
            this.addModelOrExtraLib(loadedFile.data, virtualUri, monacoInstance);
          }
        } catch (fileErr) {
          console.warn(`Não foi possível carregar arquivo irmão ${itemFullPath}:`, fileErr);
        }
      }
    } catch (dirErr) {
      console.warn(`Erro ao listar diretório de arquivos irmãos ${directoryPath}:`, dirErr);
    }
  }

  /**
   * Carrega um arquivo e opcionalmente seus re-exports relativos (export * from './...')
   */
  public async carregarArquivoComReexports(
    filePath: string,
    monacoInstance: any,
    currentDepth = 0,
    maxDepth = 2
  ): Promise<void> {
    if (!filePath || !monacoInstance) return;

    const normalizedPath = filePath.replace(/\\/g, '/');
    const virtualUri = `file:///${normalizedPath.replace(/^\/+/, '')}`;

    if (this.loadedLibs.has(virtualUri)) {
      return;
    }

    try {
      const fileLoaded = await lastValueFrom(
        this.fileExplorer.readFile({ body: { path: normalizedPath } })
      );

      if (fileLoaded?.data && typeof fileLoaded.data === 'string') {
        const content = fileLoaded.data;
        this.addModelOrExtraLib(content, virtualUri, monacoInstance);

        // Se for um entrypoint (index ou public-api), carrega re-exports relativos para fornecer tipagens completas
        if (currentDepth < maxDepth && (normalizedPath.endsWith('index.ts') || normalizedPath.endsWith('public-api.ts'))) {
          const lastSlash = normalizedPath.lastIndexOf('/');
          const dir = lastSlash > -1 ? normalizedPath.substring(0, lastSlash) : '';

          const reExportRegex = /(?:export|import)\s+[\w*\s{},]*from\s+['"](\.[^'"]+)['"]/g;
          let match: RegExpExecArray | null;
          const reExports = new Set<string>();

          while ((match = reExportRegex.exec(content)) !== null) {
            if (match[1]) reExports.add(match[1]);
          }

          for (const rePath of reExports) {
            const reResolved = await this.findResolvedPath(dir, rePath);
            if (reResolved) {
              await this.carregarArquivoComReexports(reResolved, monacoInstance, currentDepth + 1, maxDepth);
            }
          }
        }
      }
    } catch { }
  }

  /**
   * Analisa todas as cláusulas de importação (relativas e de bibliotecas internas)
   * e busca os arquivos correspondentes via tsconfig e FileExplorerService
   */
  private async resolverTodosImports(
    currentFilePath: string,
    content: string,
    monacoInstance: any
  ): Promise<void> {
    const importRegex = /(?:import|export)\s+(?:[\w*\s{},]*from\s+)?['"]([^'"]+)['"]/g;
    const matches = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = importRegex.exec(content)) !== null) {
      if (match[1]) {
        matches.add(match[1]);
      }
    }

    for (const importPath of matches) {
      try {
        const resolved = await this.resolveTsModulePath(importPath, currentFilePath);
        if (resolved) {
          await this.carregarArquivoComReexports(resolved, monacoInstance, 0, 2);
        }
      } catch { }
    }
  }

  /**
   * Resolve caminhos relativos (../ e ./)
   */
  private resolvePath(baseDir: string, relativePath: string): string {
    const combined = `${baseDir}/${relativePath}`;
    const segments = combined.split('/');
    const resolvedSegments: string[] = [];

    for (const seg of segments) {
      if (!seg || seg === '.') continue;
      if (seg === '..') {
        resolvedSegments.pop();
      } else {
        resolvedSegments.push(seg);
      }
    }

    const prefix = baseDir.startsWith('/') ? '/' : '';
    return prefix + resolvedSegments.join('/');
  }

  /**
   * Cria ou recupera o NuMonacoEditorModel com a URI virtual oficial
   */
  public getOrCreateModel(
    filePath: string,
    content: string,
    language: string,
    monacoInstance: any = (typeof monaco !== 'undefined' ? monaco : null)
  ): NuMonacoEditorModel {
    const normalizedPath = filePath.replace(/\\/g, '/');
    const cleanPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
    const fileUri = monacoInstance?.Uri
      ? monacoInstance.Uri.parse(`file:///${cleanPath.replace(/^\/+/, '')}`)
      : undefined;

    if (monacoInstance?.editor && fileUri) {
      let existingModel = monacoInstance.editor.getModel(fileUri);
      if (!existingModel) {
        existingModel = monacoInstance.editor.createModel(content, language, fileUri);
        this.loadedModels.set(fileUri.toString(), existingModel);
      } else {
        if (existingModel.getValue() !== content) {
          existingModel.setValue(content);
        }
      }
    }

    return {
      value: content,
      language: language,
      uri: fileUri
    };
  }

  /**
   * Limpa modelos e bibliotecas carregadas
   */
  public clearWorkspace(): void {
    if (this.openerDisposable) {
      try {
        this.openerDisposable.dispose();
      } catch { }
      this.openerDisposable = undefined;
    }

    this.loadedModels.forEach(model => {
      try {
        if (model) model.dispose();
      } catch (e) {
        console.warn('Erro ao descartar modelo:', e);
      }
    });
    this.loadedModels.clear();

    this.loadedLibs.forEach(item => {
      try {
        item?.disposable?.dispose?.();
      } catch (e) {
        console.warn('Erro ao descartar biblioteca extra:', e);
      }
    });
    this.loadedLibs.clear();
  }
}