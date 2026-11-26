import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileExplorerService } from '@ci/portal-api';
import { of } from 'rxjs';
import { HomepageComponent } from './homepage/homepage.component';
import { CodeEditorComponent } from './code-editor/code-editor.component';

describe('Àpps Codex', () => {
    let component: HomepageComponent;
    let fixture: ComponentFixture<HomepageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HomepageComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(HomepageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Componente criado com sucesso', () => {
        expect(component).toBeTruthy();
    });

    it('deve resolver arquivo .map (SourceMap) para o .ts correspondente quando aberto via janela com CodeX', async () => {
        const readFileSpy = jasmine.createSpy('readFile').and.callFake((params: any) => {
            const p = params?.body?.path;
            if (p === 'dist/sample.js.map') {
                return of({
                    path: 'dist/sample.js.map',
                    name: 'sample.js.map',
                    data: JSON.stringify({
                        version: 3,
                        file: 'sample.js',
                        sources: ['../src/sample.ts'],
                        sourcesContent: ['export const inlineTs = 1;'],
                    }),
                });
            }
            if (p === 'src/sample.ts') {
                return of({
                    path: 'src/sample.ts',
                    name: 'sample.ts',
                    data: 'export const realTsFile = true;',
                });
            }
            return of({ path: p, data: '' });
        });

        await TestBed.resetTestingModule().configureTestingModule({
            imports: [CodeEditorComponent],
            providers: [
                { provide: FileExplorerService, useValue: { readFile: readFileSpy } },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {
                        file: 'dist/sample.js.map',
                        mapFile: 'dist/sample.js.map',
                    },
                },
            ],
        }).compileComponents();

        const editorFixture = TestBed.createComponent(CodeEditorComponent);
        const editorComp = editorFixture.componentInstance;
        await Promise.resolve();
        await Promise.resolve();

        expect(editorComp.resolvedFromMapPath).toBe('dist/sample.js.map');
        expect(editorComp.oppenedFile?.path).toBe('src/sample.ts');
        expect(editorComp.value).toBe('export const realTsFile = true;');
        expect(editorComp.language).toBe('typescript');
    });
});
