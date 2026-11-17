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
});
