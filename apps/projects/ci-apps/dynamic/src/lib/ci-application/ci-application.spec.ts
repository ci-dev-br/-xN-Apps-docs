import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { Apps } from '@ci/core';
import { ApplicationService, BlockService } from '@ci/portal-api';
import { NavbarService } from '@ci/components';
import { BlockHistoryDialogComponent } from '../block-history/block-history-dialog.component';
import { BlocksBuilderComponent } from '../blocks-builder/blocks-builder.component';
import { DynamicComponentDefinition } from '../blocks-builder/blocks-builder.models';
import { DYNAMIC_DEFAULT_COMPONENTS } from '../blocks-builder/default-components';
import { ComponentPreviewComponent, DYNAMIC_PREVIEW_STORAGE_KEY } from '../component-preview/component-preview.component';
import { HomeComponent } from './home/home.component';

describe('Àpps Dynamic, Início', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    const mockApplicationService = {
        getList: () => of([{ id: 'app-1', name: 'App Teste', routePath: '/Teste' }]),
        sync: (params: any) => of(params.body.data),
    };

    const mockBlockService = {
        getList: () => of([]),
        sync: (params: any) => of({ data: { ...params.body.data, internalId: 'blk-1' } }),
        delete: () => of({}),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HomeComponent, NoopAnimationsModule],
            providers: [
                { provide: ApplicationService, useValue: mockApplicationService },
                { provide: BlockService, useValue: mockBlockService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Componente criado com sucesso', () => {
        expect(component).toBeTruthy();
    });

    it('deve registrar ações de contexto na NavbarService e limpar ao destruir', () => {
        const navbarService = TestBed.inject(NavbarService);
        expect(navbarService.contextTitle()).toBe('Dynamic XD');
        expect(navbarService.contextActions().length).toBe(6);

        fixture.destroy();
        expect(navbarService.contextActions().length).toBe(0);
    });
});

describe('BlocksBuilderComponent', () => {
    let builder: BlocksBuilderComponent;
    let fixture: ComponentFixture<BlocksBuilderComponent>;

    const sampleComponents: DynamicComponentDefinition[] = [
        {
            name: 'custom-card',
            title: 'Cartão Customizado',
            inputs: [
                { name: 'titulo', label: 'Título', type: 'string', defaultValue: 'Olá' },
                { name: 'ativo', label: 'Ativo', type: 'boolean', defaultValue: true },
            ],
        },
    ];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BlocksBuilderComponent, NoopAnimationsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(BlocksBuilderComponent);
        builder = fixture.componentInstance;
        builder.availableComponents = sampleComponents;
        fixture.detectChanges();
    });

    it('deve adicionar bloco com inputs padrão a partir da lista de componentes', () => {
        let emitted: any;
        builder.valueChange.subscribe(val => (emitted = val));

        builder.addBlock(sampleComponents[0]);

        expect(emitted?.blocks?.length).toBe(1);
        expect(emitted.blocks[0].componentName).toBe('custom-card');
        expect(emitted.blocks[0].inputs).toEqual({ titulo: 'Olá', ativo: true });
    });

    it('deve criar bloco ao soltar componente da paleta via drag-and-drop', () => {
        const targetList = (builder as any).spec.blocks;
        builder.onDropBlock(
            {
                previousContainer: { id: 'palette-drop-list', data: sampleComponents } as any,
                container: { id: 'canvas-list', data: targetList } as any,
                previousIndex: 0,
                currentIndex: 0,
                item: { data: sampleComponents[0] } as any,
                isPointerOverContainer: true,
                distance: { x: 0, y: 0 },
                dropPoint: { x: 0, y: 0 },
                event: new MouseEvent('mouseup'),
            },
            targetList
        );

        expect(targetList.length).toBe(1);
        expect(targetList[0].componentName).toBe('custom-card');
        expect(targetList[0].inputs).toEqual({ titulo: 'Olá', ativo: true });
    });

    it('deve abrir o context menu do bloco com dados da posição e contexto', () => {
        builder.addBlock(sampleComponents[0]);
        const blocks = (builder as any).spec.blocks;
        const mouseEvent = new MouseEvent('contextmenu', { clientX: 140, clientY: 220 });

        builder.openBlockContextMenu(mouseEvent, blocks[0], blocks, 0, false);

        expect((builder as any).contextMenuPosition).toEqual({ x: '140px', y: '220px' });
        expect((builder as any).contextMenuData?.block.id).toBe(blocks[0].id);
        expect((builder as any).contextMenuData?.isChild).toBeFalse();
    });

    it('deve inserir bloco interno ao soltar componente da paleta dentro de um container', () => {
        const containerDef: DynamicComponentDefinition = {
            name: 'container',
            title: 'Container',
            allowChildren: true,
            inputs: [],
        };
        builder.availableComponents = [containerDef, ...sampleComponents];
        builder.addBlock(containerDef);
        const containerBlock = (builder as any).spec.blocks[0];
        delete containerBlock.children;

        builder.onDropBlock(
            {
                previousContainer: { id: 'palette-drop-list', data: builder.availableComponents } as any,
                container: { id: 'child-list', data: [] } as any,
                previousIndex: 1,
                currentIndex: 0,
                item: { data: sampleComponents[0] } as any,
                isPointerOverContainer: true,
                distance: { x: 0, y: 0 },
                dropPoint: { x: 0, y: 0 },
                event: new MouseEvent('mouseup'),
            },
            [],
            containerBlock
        );

        expect(containerBlock.children.length).toBe(1);
        expect(containerBlock.children[0].componentName).toBe('custom-card');
    });

    it('deve inserir bloco e atualizar o JSON ao soltar componente na aba JSON', () => {
        builder.onDropJsonPalette({
            previousContainer: { id: 'palette-drop-list', data: sampleComponents } as any,
            container: { id: 'json-drop-list', data: [] } as any,
            previousIndex: 0,
            currentIndex: 0,
            item: { data: sampleComponents[0] } as any,
            isPointerOverContainer: true,
            distance: { x: 0, y: 0 },
            dropPoint: { x: 0, y: 0 },
            event: new MouseEvent('mouseup'),
        });

        const parsed = JSON.parse((builder as any).jsonDraft);
        expect(parsed.blocks.length).toBe(1);
        expect(parsed.blocks[0].componentName).toBe('custom-card');
    });

    it('deve permitir arrastar e reordenar blocos internamente em componentes com children aninhados', () => {
        const containerDef: DynamicComponentDefinition = {
            name: 'container',
            title: 'Container',
            allowChildren: true,
            inputs: [],
        };
        builder.availableComponents = [containerDef, ...sampleComponents];
        builder.addBlock(containerDef);
        const outerContainer = (builder as any).spec.blocks[0];

        // Adiciona um container interno dentro do container externo
        builder.addBlock(containerDef, outerContainer);
        const innerContainer = outerContainer.children[0];

        // Adiciona dois blocos dentro do container interno
        builder.addBlock(sampleComponents[0], innerContainer);
        builder.addBlock(sampleComponents[0], innerContainer);
        const firstId = innerContainer.children[0].id;
        const secondId = innerContainer.children[1].id;

        // Reordena internamente via drag-and-drop no container interno
        const sameContainer = { id: 'inner-list', data: innerContainer.children } as any;
        builder.onDropBlock(
            {
                previousContainer: sameContainer,
                container: sameContainer,
                previousIndex: 0,
                currentIndex: 1,
                item: { data: innerContainer.children[0] } as any,
                isPointerOverContainer: true,
                distance: { x: 0, y: 0 },
                dropPoint: { x: 0, y: 0 },
                event: new MouseEvent('mouseup'),
            },
            innerContainer.children,
            innerContainer
        );

        expect(innerContainer.children.length).toBe(2);
        expect(innerContainer.children[0].id).toBe(secondId);
        expect(innerContainer.children[1].id).toBe(firstId);
    });

    it('deve serializar e parsear 1:1 entre blocos e XML/HTML5 preservando children e inputs', () => {
        const containerDef: DynamicComponentDefinition = {
            name: 'container',
            title: 'Container',
            allowChildren: true,
            inputs: [
                { name: 'gap', label: 'Gap', type: 'number', defaultValue: 16 },
            ],
        };
        builder.availableComponents = [containerDef, ...sampleComponents];
        builder.addBlock(containerDef);
        const outer = (builder as any).spec.blocks[0];
        builder.addBlock(sampleComponents[0], outer);

        const xml = builder.serializeSpecToXml((builder as any).spec);
        expect(xml).toContain('<dynamic-screen');
        expect(xml).toContain('<container');
        expect(xml).toContain('gap="16"');
        expect(xml).toContain('<custom-card');
        expect(xml).toContain('ativo="true"');

        const parsed = builder.parseXmlToSpec(xml);
        expect(parsed.blocks?.length).toBe(1);
        expect(parsed.blocks![0].componentName).toBe('container');
        expect(parsed.blocks![0].inputs?.['gap']).toBe(16);
        expect(parsed.blocks![0].children?.length).toBe(1);
        expect(parsed.blocks![0].children![0].componentName).toBe('custom-card');
        expect(parsed.blocks![0].children![0].inputs).toEqual({ titulo: 'Olá', ativo: true });
    });

    it('deve emitir previewBlockRequested ao acionar visualização isolada do bloco', () => {
        builder.addBlock(sampleComponents[0]);
        const block = (builder as any).spec.blocks[0];
        let emitted: any;
        builder.previewBlockRequested.subscribe(b => (emitted = b));

        builder.previewBlock(block);

        expect(emitted?.id).toBe(block.id);
        expect(emitted?.componentName).toBe('custom-card');
    });

    it('deve possuir componentRef configurado nos componentes catalogados de @ci/components', () => {
        const ciAction = DYNAMIC_DEFAULT_COMPONENTS.find(c => c.name === 'ci-action');
        const ciMasterDetail = DYNAMIC_DEFAULT_COMPONENTS.find(c => c.name === 'ci-master-detail');
        expect(ciAction?.componentRef).toBeDefined();
        expect(ciMasterDetail?.componentRef).toBeDefined();
    });
});

describe('ComponentPreviewComponent', () => {
    it('deve renderizar o componente catalogado via ngComponentOutlet com os inputs injetados', async () => {
        sessionStorage.setItem(
            DYNAMIC_PREVIEW_STORAGE_KEY,
            JSON.stringify({
                id: 'blk_preview_1',
                componentName: 'ci-action',
                label: 'Ação Isolada',
                inputs: { label: 'Executar Teste', icon: 'bolt' },
            })
        );

        await TestBed.configureTestingModule({
            imports: [ComponentPreviewComponent, NoopAnimationsModule],
        }).compileComponents();

        const fixture = TestBed.createComponent(ComponentPreviewComponent);
        fixture.detectChanges();

        expect((fixture.componentInstance as any).definition?.componentRef).toBeDefined();
        expect(fixture.nativeElement.textContent).toContain('Ação Isolada');
        sessionStorage.removeItem(DYNAMIC_PREVIEW_STORAGE_KEY);
    });
});

@Component({ selector: 'ci-mock-codex', standalone: true, template: '<div class="mock-codex">CodeX Mock</div>' })
class MockCodexEditorComponent { }

describe('BlockHistoryDialogComponent', () => {
    it('deve carregar snapshots e injetar o CodeX indiretamente via metadados (Apps)', async () => {
        const mockApps = {
            findCompatibleApps: jasmine.createSpy('findCompatibleApps').and.resolveTo([
                {
                    id: 'codex-editor',
                    fullPath: '/Codex/editor',
                    appName: 'Codex',
                    title: 'Editor de Código (Codex)',
                    label: 'Editar JSON no Codex',
                    icon: 'code',
                    queryParam: 'file',
                    matchedPattern: '*.json',
                    component: MockCodexEditorComponent,
                    isFallback: false,
                    isPreferred: true,
                },
            ]),
        };

        const mockBlockSvc = {
            getSnapshots: jasmine.createSpy('getSnapshots').and.returnValue(
                of([
                    {
                        internalId: 'snap-1',
                        hash: 'abc123def456',
                        createdAt: new Date().toISOString(),
                        snap: { code: { version: '1.0.0', name: 'Versão Anterior', blocks: [] } },
                    },
                ])
            ),
        };

        await TestBed.configureTestingModule({
            imports: [BlockHistoryDialogComponent, NoopAnimationsModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { block: { internalId: 'blk-1', name: 'Tela Teste' } } },
                { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
                { provide: BlockService, useValue: mockBlockSvc },
                { provide: Apps, useValue: mockApps },
            ],
        }).compileComponents();

        const fixture = TestBed.createComponent(BlockHistoryDialogComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(mockApps.findCompatibleApps).toHaveBeenCalled();
        expect(mockBlockSvc.getSnapshots).toHaveBeenCalledWith({ body: { internalId: 'blk-1' } });
        expect(fixture.componentInstance.codexComponent).toBe(MockCodexEditorComponent);
        expect(fixture.nativeElement.textContent).toContain('CodeX Mock');
    });
});
