import { S } from '@angular/cdk/keycodes';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IArquivo } from '@ci-apps/Arquivos';
import { CoreModule } from '@ci/core';
import { FileDto, FileExplorerService } from '@ci/portal-api';
import { NuMonacoEditorModule } from '@ng-util/monaco-editor';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'ci-code-editor',
    standalone: true,
    imports: [
        CoreModule,
        NuMonacoEditorModule,
        FormsModule,
    ],
    templateUrl: './code-editor.component.html',
    styleUrl: './code-editor.component.scss'
})
export class CodeEditorComponent {
    private oppenedFile?: FileDto;
    constructor(
        private readonly fileExplorer: FileExplorerService,
        private readonly activatedRoute: ActivatedRoute
    ) {
        this.activatedRoute.queryParams.subscribe(async (query: any) => {
            if (query.file) {
                const file_loaded = await lastValueFrom(this.fileExplorer.readFile({
                    body: {
                        path: query.file
                    }
                }));
                this.oppenedFile = file_loaded;
                this.value = file_loaded.data as string;
                this.editorOptions.language = undefined as any;
            }
        })
    }
    value?: string;
    editorOptions = {
        theme: 'vs-dark',
        language: 'typescript',
    };

}
