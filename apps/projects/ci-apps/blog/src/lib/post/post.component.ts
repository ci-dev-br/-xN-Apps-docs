import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FileDto, FileExplorerService } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";

@Component({
    selector: 'ci-post',
    templateUrl: 'post.component.html',
    styleUrls: [
        'post.component.scss'
    ]
})
export class PostComponent {
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
            }
        })
    }
    value?: string;
    editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
        theme: 'vs-dark',
        wordWrap: 'on',
    };
}