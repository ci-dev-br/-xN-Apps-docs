import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Apps, CoreModule, DaoBuilder } from '@ci/core';
import { CodexService } from '@ci/portal-api';
import { UserAuthenticationService } from '@ci/auth';
import { WindowService } from '@ci/components/window';
import { BehaviorSubject, of } from 'rxjs';
import { DynFormComponent } from './dyn-form.component';
import { DynFormModule } from './dyn-form.module';

@Component({
  selector: 'ci-test-inline-dyn-widget',
  standalone: true,
  template: `<div class="inline-dyn-widget" [attr.data-field]="fieldName">{{ label }}:{{ value }}</div>`,
})
class TestInlineDynWidgetComponent {
  @Input() fieldName?: string;
  @Input() label?: string;
  @Input() value?: any;
}

@Component({
  selector: 'ci-test-codex-window-stub',
  standalone: true,
  template: `<div class="codex-window-stub">CodeX Window</div>`,
})
class TestCodexWindowStubComponent { }

describe('DynFormComponent & Schema Type Representation', () => {
  let component: DynFormComponent;
  let fixture: ComponentFixture<DynFormComponent>;
  let fb: FormBuilder;
  let windowSpy: jasmine.SpyObj<WindowService>;
  let codexSpy: jasmine.SpyObj<CodexService>;
  let user$: BehaviorSubject<any>;

  const mockSchema = {
    type: 'object',
    properties: {
      ativo: { type: 'boolean', title: 'Ativo' },
      nascimento: { type: 'string', format: 'date', title: 'Data Nascimento' },
      agendamento: { type: 'string', format: 'date-time', title: 'Agendamento' },
      status: { type: 'string', enum: ['RASCUNHO', 'PUBLICADO'], title: 'Status' },
      permissoes: { type: 'array', items: { type: 'string' }, enum: ['READ', 'WRITE'], title: 'Permissões' },
      tags: { type: 'array', items: { type: 'string' }, title: 'Tags' },
      quantidade: { type: 'integer', title: 'Quantidade' },
      descricaoLonga: { type: 'string', format: 'textarea', title: 'Descrição' },
      configJson: { type: 'object', format: 'json', title: 'Configuração' },
      scriptTs: { type: 'ts', format: 'ts', title: 'Script TypeScript' },
      customWidget: { type: 'dynamic', format: 'custom-inline', title: 'Widget Dinâmico' },
    },
  };

  const mockRoutes: Routes = [
    {
      path: 'codex',
      data: {
        appName: 'Codex',
        title: 'Editor CodeX',
        dynamicTypes: {
          ts: {
            type: 'ts',
            format: 'ts',
            filePatterns: ['*.ts', '*.map'],
            label: 'TypeScript (CodeX)',
            icon: 'code',
            component: TestCodexWindowStubComponent,
            openInWindow: true,
            windowTitle: 'CodeX — Editor TypeScript',
          },
          map: {
            type: 'map',
            format: 'map',
            filePatterns: ['*.map'],
            label: 'Editar .ts via SourceMap (.map)',
            icon: 'account_tree',
            component: TestCodexWindowStubComponent,
            openInWindow: true,
            windowTitle: 'CodeX — Editar .ts via .map',
          },
        },
      },
      children: [],
    },
    {
      path: 'custom-app',
      data: {
        appName: 'CustomApp',
        dynamicTypes: [
          {
            type: 'custom-inline',
            format: 'custom-inline',
            label: 'Inline Custom Type',
            component: TestInlineDynWidgetComponent,
            openInWindow: false,
          },
        ],
      },
      children: [],
    },
  ];

  beforeEach(async () => {
    windowSpy = jasmine.createSpyObj<WindowService>('WindowService', ['open']);
    windowSpy.open.and.resolveTo({ value: 'export const updated = true;' });
    user$ = new BehaviorSubject<any>({ id: 'u-1', roles: ['USER'] });
    codexSpy = jasmine.createSpyObj<CodexService>('CodexService', ['locateFiles']);
    codexSpy.locateFiles.and.callFake(({ name }: any) =>
      of({
        query: name,
        found: true,
        total: 1,
        primaryFile: {
          name,
          path: `apps/projects/ci/components/src/lib/dyn-form/src/${name}`,
          directory: 'apps/projects/ci/components/src/lib/dyn-form/src',
          extension: '.ts',
          size: 1024,
          score: 100,
        },
        files: [
          {
            name,
            path: `apps/projects/ci/components/src/lib/dyn-form/src/${name}`,
            directory: 'apps/projects/ci/components/src/lib/dyn-form/src',
            extension: '.ts',
            size: 1024,
            score: 100,
          },
        ],
      })
    );

    await TestBed.configureTestingModule({
      imports: [
        DynFormModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        CoreModule,
        RouterTestingModule.withRoutes(mockRoutes),
      ],
      providers: [
        Apps,
        {
          provide: DaoBuilder,
          useValue: {
            getSchema: jasmine.createSpy('getSchema').and.resolveTo(mockSchema),
          },
        },
        { provide: WindowService, useValue: windowSpy },
        { provide: CodexService, useValue: codexSpy },
        { provide: UserAuthenticationService, useValue: { user: user$ } },
      ],
    }).compileComponents();

    fb = TestBed.inject(FormBuilder);
    fixture = TestBed.createComponent(DynFormComponent);
    component = fixture.componentInstance;
    component.schemaName = 'MockEntity';
    component.data = {
      ativo: true,
      nascimento: '2026-11-26',
      status: 'PUBLICADO',
      permissoes: ['READ'],
      tags: ['alpha'],
      quantidade: 5,
      configJson: { ok: true },
      scriptTs: 'server/dist/main.js.map',
      customWidget: 'valor-teste',
    };
    component.formGroup = fb.group({
      ativo: [true],
      nascimento: ['2026-11-26'],
      agendamento: [null],
      status: ['PUBLICADO'],
      permissoes: [['READ']],
      tags: [['alpha']],
      quantidade: [5],
      descricaoLonga: ['texto'],
      configJson: [{ ok: true }],
      scriptTs: ['server/dist/main.js.map'],
      customWidget: ['valor-teste'],
    });
  });

  it('deve construir os campos do schema com tipos representativos e tipos dinâmicos injetados via route.data', async () => {
    await component.ngOnInit();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const fields = component.source?.fields || [];
    const byProp = (prop: string) => fields.find(f => f.property === prop);

    expect(byProp('ativo')?.type).toBe('boolean');
    expect(byProp('nascimento')?.type).toBe('date');
    expect(byProp('agendamento')?.type).toBe('date-time');
    expect(byProp('status')?.type).toBe('option');
    expect(byProp('permissoes')?.type).toBe('multi-option');
    expect(byProp('tags')?.type).toBe('chips');
    expect(byProp('quantidade')?.type).toBe('integer');
    expect(byProp('descricaoLonga')?.type).toBe('textarea');
    expect(byProp('configJson')?.type).toBe('json');

    expect(byProp('scriptTs')?.dynamicType?.type).toBe('ts');
    expect(byProp('scriptTs')?.dynamicType?.openInWindow).toBeTrue();
    expect(byProp('scriptTs')?.dynamicType?.component).toBe(TestCodexWindowStubComponent);

    expect(byProp('customWidget')?.dynamicType?.type).toBe('custom-inline');
    expect(byProp('customWidget')?.dynamicType?.component).toBe(TestInlineDynWidgetComponent);

    const native: HTMLElement = fixture.nativeElement;
    expect(native.querySelector('mat-slide-toggle')).not.toBeNull();
    expect(native.querySelector('ci-dyn-input-date')).not.toBeNull();
    expect(native.querySelectorAll('mat-select').length).toBeGreaterThanOrEqual(2);
    expect(native.querySelector('mat-chip-grid')).not.toBeNull();
    expect(native.querySelector('.inline-dyn-widget')?.textContent).toContain('Widget Dinâmico:valor-teste');
  });

  it('deve abrir campo .ts / .map em janela do CodeX via WindowService e atualizar o FormControl com retorno', async () => {
    await component.ngOnInit();
    fixture.detectChanges();

    const triggerBtn: HTMLButtonElement | null = fixture.nativeElement.querySelector('.dyn-custom-type-field button');
    expect(triggerBtn).not.toBeNull();
    triggerBtn!.click();
    await Promise.resolve();
    await Promise.resolve();

    expect(windowSpy.open).toHaveBeenCalledWith(
      TestCodexWindowStubComponent,
      jasmine.objectContaining({
        file: 'server/dist/main.js.map',
        mapFile: 'server/dist/main.js.map',
        language: 'typescript',
      }),
      'CodeX — Editor TypeScript',
      jasmine.anything()
    );
  });

  it('deve resolver o tipo dinâmico de .map via Apps.resolveDynamicType', async () => {
    const apps = TestBed.inject(Apps);
    const matchMap = await apps.resolveDynamicType({ value: 'dist/main.js.map' });
    expect(matchMap).toBeDefined();
    expect(matchMap?.component).toBe(TestCodexWindowStubComponent);
    expect(matchMap?.openInWindow).toBeTrue();
  });

  it('deve exibir barra de edição CodeX na camada dyn-form apenas para DEVELOPER/SYSADMIN e localizar arquivo pelo nome', async () => {
    await component.ngOnInit();
    fixture.detectChanges();

    expect(component.canEditSource).toBeFalse();
    expect(fixture.nativeElement.querySelector('.ci-dyn-form-codex-bar')).toBeNull();

    user$.next({ id: 'dev-1', roles: ['USER', 'DEVELOPER'] });
    fixture.detectChanges();

    expect(component.canEditSource).toBeTrue();
    const editBtn: HTMLButtonElement | null = fixture.nativeElement.querySelector('.codex-edit-trigger');
    expect(editBtn).not.toBeNull();

    await component.openSourceInCodeX('dyn-form.component.ts');
    expect(codexSpy.locateFiles).toHaveBeenCalledWith(
      jasmine.objectContaining({ name: 'dyn-form.component.ts' })
    );
    expect(windowSpy.open).toHaveBeenCalledWith(
      TestCodexWindowStubComponent,
      jasmine.objectContaining({
        file: 'apps/projects/ci/components/src/lib/dyn-form/src/dyn-form.component.ts',
        filePath: 'apps/projects/ci/components/src/lib/dyn-form/src/dyn-form.component.ts',
        language: 'typescript',
      }),
      'CodeX — dyn-form.component.ts',
      undefined
    );
  });

  it('deve localizar nome simples de arquivo no DynInputComponent antes de abrir no CodeX', async () => {
    component.formGroup?.get('scriptTs')?.setValue('user.entity.ts');
    await component.ngOnInit();
    fixture.detectChanges();

    const triggerBtn: HTMLButtonElement | null = fixture.nativeElement.querySelector('.dyn-custom-type-field button');
    expect(triggerBtn).not.toBeNull();
    triggerBtn!.click();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(codexSpy.locateFiles).toHaveBeenCalledWith(
      jasmine.objectContaining({ name: 'user.entity.ts', limit: 1 })
    );
    expect(windowSpy.open).toHaveBeenCalledWith(
      TestCodexWindowStubComponent,
      jasmine.objectContaining({
        file: 'apps/projects/ci/components/src/lib/dyn-form/src/user.entity.ts',
        filePath: 'apps/projects/ci/components/src/lib/dyn-form/src/user.entity.ts',
      }),
      'CodeX — Editor TypeScript',
      jasmine.anything()
    );
  });
});
