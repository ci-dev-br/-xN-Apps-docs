import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiConfiguration, AuthService, InviteService, RegisterService } from '@ci/portal-api';
import { UserAuthenticationService } from '@ci/auth';
import { StageService, ApplicationCatalogService } from '@ci/core';
import { BehaviorSubject, of } from 'rxjs';
import { RegistrarComponent } from './registrar.component';

describe('RegistrarComponent & InviteService (getInvite)', () => {
  let fixture: ComponentFixture<RegistrarComponent>;
  let component: RegistrarComponent;
  let httpMock: HttpTestingController;
  let params$: BehaviorSubject<any>;
  let queryParams$: BehaviorSubject<any>;

  beforeEach(async () => {
    params$ = new BehaviorSubject<any>({ invite: 'INVITE-test-hash-123' });
    queryParams$ = new BehaviorSubject<any>({});

    await TestBed.configureTestingModule({
      imports: [
        RegistrarComponent,
        HttpClientTestingModule,
        NoopAnimationsModule,
        RouterTestingModule,
      ],
      providers: [
        ApiConfiguration,
        InviteService,
        { provide: AuthService, useValue: { registrar: jasmine.createSpy('registrar') } },
        { provide: RegisterService, useValue: { requestByFistContact: jasmine.createSpy('requestByFistContact') } },
        { provide: UserAuthenticationService, useValue: { user: new BehaviorSubject(undefined), identificarUsuario: jasmine.createSpy('identificarUsuario') } },
        { provide: StageService, useValue: {} },
        { provide: ApplicationCatalogService, useValue: { recordUsage: () => of({}), refreshMyActivations: () => of([]) } },
        {
          provide: ActivatedRoute,
          useValue: { params: params$, queryParams: queryParams$ },
        },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(RegistrarComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpMock.match((r) => !r.url.includes('/Invite/'));
    httpMock.verify();
  });

  it('deve enviar convite/invite/inviteHash no body de POST /Invite/GetInvite e avançar para invite-registration', async () => {
    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.url.endsWith('/Invite/GetInvite') && r.method === 'POST');
    expect(req.request.body).toEqual(
      jasmine.objectContaining({
        convite: 'INVITE-test-hash-123',
        invite: 'INVITE-test-hash-123',
        inviteHash: 'INVITE-test-hash-123',
      }),
    );

    req.flush({
      internalId: 'inv-1',
      email: 'usuario@ci.dev.br',
      friendlyName: 'Novo Usuário',
      inviteHash: 'INVITE-test-hash-123',
      roles: ['USER', 'DEVELOPER'],
      invited: true,
      accepted: false,
    });

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.stage).toBe('invite-registration');
    expect(component.inviteData?.email).toBe('usuario@ci.dev.br');
    expect(component.inviteForm.get('email')?.value).toBe('usuario@ci.dev.br');
    expect(fixture.nativeElement.textContent).toContain('ROLE: USER, DEVELOPER');
  });
});
