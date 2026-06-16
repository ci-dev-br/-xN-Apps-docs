import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CoreModule } from '@ci/core';
import { FileDto, FileExplorerService } from '@ci/portal-api';
import { NuMonacoEditorModule } from '@ng-util/monaco-editor';
import { lastValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { MatIconModule } from '@angular/material/icon';
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
    ],
    templateUrl: './code-editor.component.html',
    styleUrl: './code-editor.component.scss'
})
export class CodeEditorComponent {
    fullscreen?: boolean = false;
    carregando = true;
    oppenedFile?: FileDto;
    constructor(
        private readonly fileExplorer: FileExplorerService,
        private readonly activatedRoute: ActivatedRoute,
    ) {
        this.activatedRoute.queryParams.subscribe(async (query: any) => {
            if (query.file) {
                this.carregando = true;
                try {
                    const file_loaded = await lastValueFrom(this.fileExplorer.readFile({
                        body: {
                            path: query.file
                        }
                    }));
                    this.oppenedFile = file_loaded;
                    this.value = file_loaded.data as string;
                } catch (e) {
                }
                if (!this.oppenedFile?.data) {
                    alert("Arquivo inexistente, criado novo arquivo");
                    this.oppenedFile = {
                        path: query.file,
                        data: '// novo arquivo criado ...'
                    }
                    this.value = '// novo arquivo criado ...';
                }
                if (query?.file?.indexOf('.ts') > -1) {
                    this.selectLanguage('typescript');
                    // Exemplo de configuração do compilador
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
    @Input()
    language?: string;
    value?: string;
    editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
        theme: 'vs-dark',
        wordWrap: 'on',
    };
    async selectLanguage(language?: string) {
        this.editorOptions.language = language;
    }
    async confirmar() {
        await lastValueFrom(
            this.fileExplorer.readFile({
                body: {
                    ...this.oppenedFile,
                    data: this.value
                }
            }));
    }

}
