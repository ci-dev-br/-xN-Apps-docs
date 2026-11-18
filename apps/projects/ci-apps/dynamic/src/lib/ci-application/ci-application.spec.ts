import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ApplicationService, BlockService } from '@ci/portal-api';
import { BlocksBuilderComponent } from '../blocks-builder/blocks-builder.component';
import { DynamicComponentDefinition } from '../blocks-builder/blocks-builder.models';
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
        builder.onDropBlock(
            {
                previousContainer: { id: 'inner-list', data: innerContainer.children } as any,
                container: { id: 'inner-list', data: innerContainer.children } as any,
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

        // Nota: no mock, previousContainer === container verifica referência de objeto
        // Vamos testar com a mesma referência de container:
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
});
