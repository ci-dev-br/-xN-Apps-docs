import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { EncryptedMessagerService } from '@ci/portal-api';
import { CiApplicationModule } from './ci-application.module';
import { HomeComponent } from './views/home/home.component';

describe('Apps Mensagens (HomeComponent)', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;
    let messagerSpy: jasmine.SpyObj<EncryptedMessagerService>;

    const mockConversation = {
        id: 'a'.repeat(64),
        channelHash: 'a'.repeat(64),
        title: 'Contato Teste',
        contactId: 'user-2',
        contactName: 'Contato Teste',
        lastMessage: '',
        lastMessageAt: '2026-11-27T00:00:00.000Z',
        unreadCount: 0,
    };

    beforeEach(async () => {
        messagerSpy = jasmine.createSpyObj<EncryptedMessagerService>('EncryptedMessagerService', [
            'listarConversas',
            'listarMensagens',
            'enviarMensagem',
            'obterOuCriarConversa',
            'listarUsuarios',
        ]);
        messagerSpy.listarConversas.and.returnValue(of([mockConversation]));
        messagerSpy.listarMensagens.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [
                CiApplicationModule,
                NoopAnimationsModule,
            ],
            providers: [
                { provide: EncryptedMessagerService, useValue: messagerSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('deve criar o componente e carregar as conversas', () => {
        expect(component).toBeTruthy();
        expect(messagerSpy.listarConversas).toHaveBeenCalled();
        expect(component.conversas.length).toBe(1);
    });

    it('deve enviar mensagem criptografada e atualizar conversa e histórico', () => {
        component.selecionarConversa(mockConversation);
        component.textoMensagem = 'Olá, mensagem segura!';

        messagerSpy.enviarMensagem.and.returnValue(of({
            id: 'msg-1',
            conversationId: mockConversation.id,
            senderId: 'user-1',
            senderName: 'Eu',
            recipientId: 'user-2',
            content: 'Olá, mensagem segura!',
            rawEncryptedContent: 'U2FsdGVkX1+mock',
            attachments: [],
            read: false,
            createdAt: '2026-11-27T00:01:00.000Z',
            isMyMessage: true,
        }));

        component.enviarMensagem();

        expect(messagerSpy.enviarMensagem).toHaveBeenCalledWith(
            mockConversation.id,
            'Olá, mensagem segura!',
            []
        );
        expect(component.mensagens.length).toBe(1);
        expect(component.mensagens[0].content).toBe('Olá, mensagem segura!');
        expect(component.textoMensagem).toBe('');
        expect(component.enviando).toBeFalse();
        expect(component.conversaAtiva?.lastMessage).toBe('Olá, mensagem segura!');
    });

    it('deve liberar estado enviando quando houver falha no envio', () => {
        component.selecionarConversa(mockConversation);
        component.textoMensagem = 'Falha no envio';
        messagerSpy.enviarMensagem.and.returnValue(
            throwError(() => ({ error: { message: 'Falha simulada' } }))
        );

        component.enviarMensagem();

        expect(component.enviando).toBeFalse();
        expect(component.textoMensagem).toBe('Falha no envio');
        expect(component.mensagens.length).toBe(0);
    });
});
