import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiConfiguration } from '../lib/api-configuration';
import { MessagerService } from '../lib/services/messager.service';
import { EncryptedMessagerService } from './encrypted-messager.service';

describe('EncryptedMessagerService', () => {
  let service: EncryptedMessagerService;
  let httpMock: HttpTestingController;
  const rootUrl = 'https://api.test.local';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ApiConfiguration, useValue: { rootUrl } },
        MessagerService,
        EncryptedMessagerService,
      ],
    });

    service = TestBed.inject(EncryptedMessagerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve cifrar no cliente e enviar mensagem via POST /Messager/Conversations/:id/Messages', () => {
    const convId = 'a'.repeat(64);
    let resultado: any;

    service.enviarMensagem(convId, 'Mensagem secreta', []).subscribe((res) => {
      resultado = res;
    });

    const req = httpMock.expectOne(`${rootUrl}/Messager/Conversations/${convId}/Messages`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.encryptedContent).toBeTruthy();
    expect(req.request.body.encryptedContent.startsWith('U2FsdGVk')).toBeTrue();
    expect(req.request.body.encryptedContent).not.toContain('Mensagem secreta');

    req.flush({
      internalId: 'msg-123',
      conversationId: convId,
      messageHash: 'hash-1',
      previousMessageHash: 'GENESIS',
      senderId: 'user-1',
      senderName: 'Usuário Teste',
      recipientId: 'user-2',
      encryptedContent: req.request.body.encryptedContent,
      attachments: [],
      read: false,
      createdAt: '2026-11-27T00:00:00.000Z',
    });

    expect(resultado).toBeTruthy();
    expect(resultado.id).toBe('msg-123');
    expect(resultado.content).toBe('Mensagem secreta');
    expect(resultado.isMyMessage).toBeTrue();
    expect(service.decryptText(resultado.rawEncryptedContent, convId)).toBe('Mensagem secreta');
  });

  it('deve listar conversas e mensagens utilizando exclusivamente rotas POST', () => {
    const convId = 'b'.repeat(64);

    service.listarConversas().subscribe();
    const convReq = httpMock.expectOne(`${rootUrl}/Messager/Conversations/List`);
    expect(convReq.request.method).toBe('POST');
    convReq.flush([]);

    service.listarMensagens(convId).subscribe();
    const msgReq = httpMock.expectOne(`${rootUrl}/Messager/Conversations/${convId}/Messages/List`);
    expect(msgReq.request.method).toBe('POST');
    msgReq.flush([]);

    service.listarUsuarios('maria').subscribe();
    const usersReq = httpMock.expectOne(`${rootUrl}/Messager/Users`);
    expect(usersReq.request.method).toBe('POST');
    expect(usersReq.request.body).toEqual({ search: 'maria' });
    usersReq.flush([]);
  });
});
