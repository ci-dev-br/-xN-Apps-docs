import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { UserAuthenticationService } from '@ci/auth';
import { ApiConfiguration } from '../lib/api-configuration';
import { User } from '../lib/models/user';
import {
  InternalNotificationService,
  NOTIFICATION_PREF_CODES,
} from './internal-notification.service';

describe('InternalNotificationService (Preferências do Usuário)', () => {
  let service: InternalNotificationService;
  let httpMock: HttpTestingController;
  let user$: BehaviorSubject<User | undefined>;

  beforeEach(() => {
    localStorage.clear();
    user$ = new BehaviorSubject<User | undefined>(undefined);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        InternalNotificationService,
        { provide: ApiConfiguration, useValue: { rootUrl: 'http://localhost:3000' } },
        { provide: UserAuthenticationService, useValue: { user: user$ } },
      ],
    });

    service = TestBed.inject(InternalNotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    service.stopPolling();
    httpMock.verify();
    localStorage.clear();
  });

  it('deve carregar preferências vindas do perfil do usuário e sincronizar com o backend', () => {
    user$.next({
      id: 'user-pref-1',
      username: 'paulo',
      preferences: [
        { userId: 'user-pref-1', code: NOTIFICATION_PREF_CODES.DISPLAY_MODE, value: 'sidebar' },
        { userId: 'user-pref-1', code: NOTIFICATION_PREF_CODES.SOUND_ENABLED, value: 'false' },
        { userId: 'user-pref-1', code: NOTIFICATION_PREF_CODES.PUSH_ENABLED, value: 'false' },
        { userId: 'user-pref-1', code: NOTIFICATION_PREF_CODES.MUTED_TYPES, value: '["SISTEMA"]' },
      ],
    } as any);

    const prefReq = httpMock.expectOne('http://localhost:3000/Notification/Preferences');
    prefReq.flush({
      enabled: true,
      displayMode: 'sidebar',
      soundEnabled: false,
      pushEnabled: false,
      mutedTypes: ['SISTEMA'],
    });

    const myReq = httpMock.expectOne('http://localhost:3000/Notification/My');
    myReq.flush({
      unreadCount: 2,
      notifications: [
        { id: 'n1', title: 'Msg', message: 'Oi', type: 'MENSAGEM', read: false, createdAt: '' },
        { id: 'n2', title: 'Sys', message: 'Log', type: 'SISTEMA', read: false, createdAt: '' },
      ],
    });

    expect(service.displayMode).toBe('sidebar');
    expect(service.preferences.soundEnabled).toBeFalse();
    expect(service.preferences.pushEnabled).toBeFalse();
    expect(service.preferences.mutedTypes).toEqual(['SISTEMA']);

    let latestNotifs: any[] = [];
    let latestUnread = -1;
    service.notifications$.subscribe(list => (latestNotifs = list));
    service.unreadCount$.subscribe(cnt => (latestUnread = cnt));

    expect(latestNotifs.map(n => n.id)).toEqual(['n1']);
    expect(latestUnread).toBe(1);
  });

  it('não deve consultar notificações nem disparar alertas/som quando usuário desativar notificações', () => {
    user$.next({
      id: 'user-pref-2',
      username: 'paulo',
      preferences: [
        { userId: 'user-pref-2', code: NOTIFICATION_PREF_CODES.ENABLED, value: 'false' },
      ],
    } as any);

    const prefReq = httpMock.expectOne('http://localhost:3000/Notification/Preferences');
    prefReq.flush({
      enabled: false,
      displayMode: 'menu',
      pushEnabled: true,
      soundEnabled: true,
      mutedTypes: [],
    });

    // Como enabled é false, /Notification/My NÃO deve ser chamado
    httpMock.expectNone('http://localhost:3000/Notification/My');
    expect(service.preferences.enabled).toBeFalse();

    const pushSpy = spyOn(service, 'dispararPushLocal').and.callThrough();
    const soundSpy = spyOn(service, 'tocarSomNotificacao').and.callThrough();
    service.carregarNotificacoes(true);
    httpMock.expectNone('http://localhost:3000/Notification/My');
    expect(pushSpy).not.toHaveBeenCalled();
    expect(soundSpy).not.toHaveBeenCalled();
  });

  it('deve bloquear som e push local quando preferências estiverem desabilitadas ou categoria silenciada', () => {
    service.updatePreferences({
      enabled: true,
      pushEnabled: false,
      soundEnabled: false,
      mutedTypes: ['GRUPO'],
    }, false);

    // Garante que AudioContext / Notification não sejam invocados
    const origAudioCtx = (window as any).AudioContext;
    const audioSpy = jasmine.createSpy('AudioContext');
    (window as any).AudioContext = audioSpy;

    service.tocarSomNotificacao();
    expect(audioSpy).not.toHaveBeenCalled();

    service.dispararPushLocal({
      id: 'n3',
      title: 'Teste',
      message: 'Body',
      type: 'MENSAGEM',
      read: false,
      createdAt: '',
    });

    (window as any).AudioContext = origAudioCtx;
    expect(service.isTypeMuted('GRUPO')).toBeTrue();
    expect(service.isTypeMuted('MENSAGEM')).toBeFalse();
  });

  it('deve persistir preferência no backend ao alterar displayMode', () => {
    user$.next({ id: 'user-pref-3', username: 'paulo' } as any);
    httpMock.expectOne('http://localhost:3000/Notification/Preferences').flush({
      enabled: true,
      displayMode: 'menu',
      pushEnabled: true,
      soundEnabled: true,
      mutedTypes: [],
    });
    httpMock.expectOne('http://localhost:3000/Notification/My').flush({
      unreadCount: 0,
      notifications: [],
    });

    service.setDisplayMode('statusbar');

    const saveReq = httpMock.expectOne('http://localhost:3000/Notification/Preferences');
    expect(saveReq.request.method).toBe('POST');
    expect(saveReq.request.body.displayMode).toBe('statusbar');
    saveReq.flush(saveReq.request.body);

    expect(service.displayMode).toBe('statusbar');
    expect(localStorage.getItem('ci_notification_display_mode')).toBe('statusbar');
  });
});
