import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { UserAuthenticationService } from '@ci/auth';
import { WindowService } from '@ci/components/window';
import { BehaviorSubject } from 'rxjs';
import { GerencialComponent } from './gerencial.component';

describe('GerencialComponent (Tabs por papel ADMIN vs MASTER)', () => {
  let user$: BehaviorSubject<any>;

  beforeEach(async () => {
    user$ = new BehaviorSubject<any>({
      id: 'admin-1',
      roles: ['USER', 'ADMIN'],
    });

    await TestBed.configureTestingModule({
      declarations: [GerencialComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            routeConfig: {
              children: [
                { path: 'loja', data: { title: 'Loja', icon: 'storefront', roles: ['MASTER', 'ADMIN', 'USER'] } },
                { path: 'applications', data: { title: 'Apps', icon: 'apps', roles: ['MASTER'] } },
                { path: 'user-manager', data: { title: 'Gestão de Usuários', icon: 'badge', roles: ['MASTER', 'ADMIN'] } },
              ],
            },
          },
        },
        { provide: MatDialog, useValue: {} },
        { provide: WindowService, useValue: {} },
        { provide: UserAuthenticationService, useValue: { user: user$ } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('deve exibir Loja e Gestão de Usuários para ADMIN e incluir Apps apenas para MASTER', () => {
    const fixture: ComponentFixture<GerencialComponent> = TestBed.createComponent(GerencialComponent);
    const component = fixture.componentInstance;

    expect(component.tabs?.map((t) => t.path)).toEqual(['loja', 'user-manager']);

    user$.next({ id: 'master-1', roles: ['USER', 'MASTER'] });
    expect(component.tabs?.map((t) => t.path)).toEqual(['loja', 'applications', 'user-manager']);
  });
});
