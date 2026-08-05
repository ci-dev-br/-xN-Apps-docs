import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CoreModule } from '@ci/core';
import { FileDto, FileExplorerService } from '@ci/portal-api';
import { NuMonacoEditorModule } from '@ng-util/monaco-editor';
import { lastValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// Declaração para evitar erros de compilação caso o monaco seja injetado globalmente
declare const monaco: any;

@Component({
    selector: 'ci-code-editor',
    standalone: true,
    imports: [
        CoreModule,
        NuMonacoEditorModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        BreadcrumbComponent,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
    ],
    templateUrl: './code-editor.component.html',
    styleUrl: './code-editor.component.scss'
})
export class CodeEditorComponent {
    fullscreen?: boolean = false;
    carregando = true;
    oppenedFile?: FileDto;

    @Input() language?: string;
    value?: string;

    editorOptions: any = {
        theme: 'vs-dark',
        wordWrap: 'on',
        automaticLayout: true // Recomendado para o editor se redimensionar sozinho
    };

    constructor(
        private readonly fileExplorer: FileExplorerService,
        private readonly activatedRoute: ActivatedRoute,
    ) {
        this.activatedRoute.queryParams.subscribe(async (query: any) => {
            if (query.file) {
                this.carregando = true;
                try {
                    const file_loaded = await lastValueFrom(this.fileExplorer.readFile({
                        body: { path: query.file }
                    }));
                    this.oppenedFile = file_loaded;
                    this.value = file_loaded.data as string;
                } catch (e) {
                    console.error("Erro ao carregar arquivo", e);
                }

                /* if (!this.oppenedFile?.data) {
                    alert("Arquivo inexistente, criado novo arquivo");
                    this.oppenedFile = {
                        path: query.file,
                        data: '// novo arquivo criado ...'
                    }
                    this.value = '// novo arquivo criado ...';
                } */

                if (query?.file?.indexOf('.ts') > -1) {
                    this.selectLanguage('typescript');
                    this.configurarCompiladorTypeScript();

                    // Opcional: Busca arquivos locais/tipagens para os imports funcionarem
                    await this.carregarDependenciasDeImport(query.file);

                } else if (query?.file?.indexOf('.html') > -1) {
                    this.selectLanguage('html');
                } else if (query?.file?.indexOf('.scss') > -1) {
                    this.selectLanguage('scss');
                } else {
                    this.selectLanguage(undefined);
                    this.editorOptions = { ...this.editorOptions };
                }
                this.carregando = false;
            }
        });
    }

    async selectLanguage(language?: string) {
        this.editorOptions = { ...this.editorOptions, language: language };
    }

    /**
     * Configura o comportamento do TypeScript no Monaco Editor
     */
    configurarCompiladorTypeScript() {
        if (typeof monaco !== 'undefined') {
            const tsDefaults = monaco.languages.typescript.typescriptDefaults;

            // Configurações padrão de compilação idênticas a um tsconfig.json comum
            tsDefaults.setCompilerOptions({
                target: monaco.languages.typescript.ScriptTarget.ES2020,
                allowNonTsExtensions: true,
                moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                module: monaco.languages.typescript.ModuleKind.CommonJS,
                noEmit: true,
                esModuleInterop: true,
                experimentalDecorators: true,
                emitDecoratorMetadata: true,
                jsx: monaco.languages.typescript.JsxEmit.React, // Útil se tiver arquivos TSX
                typeRoots: ["node_modules/@types"]
            });

            // Evita que o editor valide bibliotecas padrões que não carregamos inteiras
            tsDefaults.setDiagnosticsOptions({
                noSemanticValidation: false,
                noSyntaxValidation: false,
            });
        }
    }

    /**
     * Simulação de carregamento de dependências.
     * Para um import local como "import { Algo } from './meu-arquivo'" parar de dar erro,
     * o Monaco precisa conhecer o conteúdo de './meu-arquivo.ts'.
     */
    async carregarDependenciasDeImport(currentFilePath: string) {
        // if (typeof monaco === 'undefined') return;

        // EXEMPLO 1: Injetando tipagens externas (node_modules)
        // Em um cenário real, você buscaria esse .d.ts do seu backend NestJS.
        const angularCoreDts = `
            export declare class Component { constructor(props?: any); }
            export declare class Input { constructor(props?: any); }
        `;
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
            angularCoreDts,
            'file:///node_modules/@angular/core/index.d.ts'
        );

        // EXEMPLO 2: Resolvendo arquivos locais do mesmo diretório.
        // Se o usuário está editando '/src/app/main.ts', você pode usar o seu FileExplorerService
        // para ler a pasta '/src/app/', e injetar os outros arquivos .ts usando addExtraLib:

        /* const diretorio = currentFilePath.substring(0, currentFilePath.lastIndexOf('/'));
        const arquivosDaPasta = await lastValueFrom(this.fileExplorer.readDirectory({ body: { path: diretorio } }));
        
        for (const file of arquivosDaPasta) {
            if (file.name.endsWith('.ts') && file.path !== currentFilePath) {
                 const content = await lastValueFrom(this.fileExplorer.readFile({ body: { path: file.path } }));
                 // O Monaco usa URIs virtuais (file:///) para mapear os imports
                 monaco.languages.typescript.typescriptDefaults.addExtraLib(
                     content.data,
                     `file://${file.path}`
                 );
            }
        }
        */
    }

    async confirmar() {
        await lastValueFrom(
            this.fileExplorer.readFile({ // Nota: certifique-se de que no backend a rota de salvar não é a mesma de ler.
                body: {
                    ...this.oppenedFile,
                    data: this.value
                }
            })
        );
    }
}