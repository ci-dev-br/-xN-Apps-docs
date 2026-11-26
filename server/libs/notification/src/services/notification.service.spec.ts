import { NotificationService, NOTIFICATION_PREF_CODES } from './notification.service';

describe('NotificationService (Preferências do Usuário)', () => {
    let notifRepoMock: any;
    let pushRepoMock: any;
    let prefStore: Array<{ userId: string; code: string; value: string }>;
    let prefRepoMock: any;
    let dataSourceMock: any;
    let service: NotificationService;

    beforeEach(() => {
        prefStore = [];
        notifRepoMock = {
            create: jest.fn((data) => ({ id: 'notif-1', ...data })),
            save: jest.fn(async (data) => data),
            find: jest.fn(async () => []),
            count: jest.fn(async () => 0),
            findOne: jest.fn(async () => null),
            update: jest.fn(async () => ({ affected: 0 })),
        };
        pushRepoMock = {
            findOne: jest.fn(async () => null),
            create: jest.fn((d) => d),
            save: jest.fn(async (d) => d),
        };
        prefRepoMock = {
            find: jest.fn(async ({ where }: any) => prefStore.filter(p => p.userId === where.userId)),
            findOne: jest.fn(async ({ where }: any) => prefStore.find(p => p.userId === where.userId && p.code === where.code) || null),
            create: jest.fn((d) => ({ ...d })),
            save: jest.fn(async (d) => {
                const idx = prefStore.findIndex(p => p.userId === d.userId && p.code === d.code);
                if (idx >= 0) prefStore[idx] = { ...d };
                else prefStore.push({ ...d });
                return d;
            }),
        };
        dataSourceMock = {
            getRepository: jest.fn((name: string) => (name === 'UserPreference' ? prefRepoMock : null)),
        };

        service = new NotificationService(notifRepoMock, pushRepoMock, dataSourceMock);
    });

    it('deve persistir e ler preferências de notificação do usuário', async () => {
        const updated = await service.atualizarPreferenciasUsuario('u-1', {
            enabled: true,
            displayMode: 'statusbar',
            pushEnabled: false,
            soundEnabled: false,
            mutedTypes: ['sistema', 'AVISO'],
        });

        expect(updated.displayMode).toBe('statusbar');
        expect(updated.pushEnabled).toBe(false);
        expect(updated.soundEnabled).toBe(false);
        expect(updated.mutedTypes).toEqual(['SISTEMA', 'AVISO']);

        const loaded = await service.obterPreferenciasUsuario('u-1');
        expect(loaded.displayMode).toBe('statusbar');
        expect(loaded.mutedTypes).toEqual(['SISTEMA', 'AVISO']);
        expect(prefStore.find(p => p.code === NOTIFICATION_PREF_CODES.SOUND_ENABLED)?.value).toBe('false');
    });

    it('deve suprimir criação de notificações quando desativadas ou em categoria silenciada', async () => {
        await service.atualizarPreferenciasUsuario('u-1', {
            enabled: true,
            mutedTypes: ['SISTEMA'],
        });

        const mutedResult = await service.criarNotificacao({
            userId: 'u-1',
            title: 'Aviso do Sistema',
            message: 'Mensagem',
            type: 'SISTEMA',
        });
        expect(mutedResult).toBeNull();
        expect(notifRepoMock.save).not.toHaveBeenCalled();

        await service.atualizarPreferenciasUsuario('u-1', { enabled: false });
        const disabledResult = await service.criarNotificacao({
            userId: 'u-1',
            title: 'Nova Mensagem',
            message: 'Oi',
            type: 'MENSAGEM',
        });
        expect(disabledResult).toBeNull();
        expect(notifRepoMock.save).not.toHaveBeenCalled();

        const forcedResult = await service.criarNotificacao({
            userId: 'u-1',
            title: 'Segurança',
            message: 'Alerta crítico',
            type: 'SISTEMA',
            metadata: { force: true },
        });
        expect(forcedResult).not.toBeNull();
        expect(notifRepoMock.save).toHaveBeenCalledTimes(1);
    });

    it('deve filtrar notificações e contagem não lida por preferências ao listar', async () => {
        notifRepoMock.find.mockResolvedValue([
            { id: '1', userId: 'u-1', title: 'Msg', message: 'a', type: 'MENSAGEM', read: false },
            { id: '2', userId: 'u-1', title: 'Sys', message: 'b', type: 'SISTEMA', read: false },
        ]);

        await service.atualizarPreferenciasUsuario('u-1', {
            enabled: true,
            mutedTypes: ['SISTEMA'],
        });

        const listed = await service.listarNotificacoes('u-1');
        expect(listed.map(n => n.id)).toEqual(['1']);

        const unread = await service.contarNaoLidas('u-1');
        expect(unread).toBe(1);

        await service.atualizarPreferenciasUsuario('u-1', { enabled: false });
        expect(await service.listarNotificacoes('u-1')).toEqual([]);
        expect(await service.contarNaoLidas('u-1')).toBe(0);
    });
});
