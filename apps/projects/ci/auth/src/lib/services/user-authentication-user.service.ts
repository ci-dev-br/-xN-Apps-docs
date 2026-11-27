import { Inject, Injectable, OnDestroy, Optional, PLATFORM_ID } from "@angular/core";
import { AuthService, ConnectedDevice, Policy, User } from "@ci/portal-api";
import { BehaviorSubject, lastValueFrom, Subscription } from "rxjs";
import { Router } from "@angular/router";
import {
    ACCOUNTS_STORAGE_KEY,
    AccessKeyCryptoService,
    CIUSR_STORAGE_KEY,
    NotificationService,
    StorageService,
    USER_STORE_KEY,
    WsService,
    clearAllAuthStorage,
    decodeBase64Utf8,
    encodeBase64Utf8,
    extractChaveAcessoFromJwt,
    extractChaveAcessoFromSession,
    getActiveAccessScope,
    isJwtExpired,
    isJwtExpiringSoon,
    readAccountsFromStorage,
    setActiveAccessScope,
    sessionStorageUpdated$,
    updateAccountTokensInStorage,
    writeAccountsToStorage,
} from "@ci/core";
import { isPlatformBrowser } from "@angular/common";
import { ConnectedAccount } from "../models/connected-account";

@Injectable()
export class UserAuthenticationService implements OnDestroy {
    private isBrowser: boolean;
    private subscriptions = new Subscription();

    /**
     * Lista de contas conectadas simultaneamente na sessão do cliente.
     */
    private $accounts = new BehaviorSubject<ConnectedAccount[]>([]);

    /**
     * Usuário ativo que está realizando as ações no momento,
     * com papéis (roles) e políticas (permission) combinadas de todas as contas conectadas.
     */
    private $user = new BehaviorSubject<User | undefined>((() => {
        if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem(CIUSR_STORAGE_KEY);
            try {
                if (stored) {
                    return JSON.parse(decodeBase64Utf8(stored));
                }
            } catch (error) {
                console.trace(error);
            }
        }
        return undefined;
    })());

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        @Optional() private readonly authService?: AuthService,
        @Optional() private readonly router?: Router,
        @Optional() private readonly storage?: StorageService,
        @Optional() private readonly notification?: NotificationService,
        @Optional() private readonly ws?: WsService,
        @Optional() private readonly accessKeyCrypto?: AccessKeyCryptoService,
    ) {
        this.isBrowser = isPlatformBrowser(this.platformId);
        if (!this.isBrowser) return;
        this.init();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    /**
     * Inicializa o gerenciador multi-contas, escuta atualizações de refresh/revogação
     * e mantém as permissões combinadas sincronizadas.
     */
    async init() {
        this.carregarContasDoStorage();

        // Sincroniza estado em memória quando o interceptor renova ou limpa tokens
        this.subscriptions.add(
            sessionStorageUpdated$.subscribe((event) => {
                if (!event) {
                    if (this.$accounts.value.length > 0 || this.$user.value) {
                        this.$accounts.next([]);
                        this.$user.next(undefined);
                    }
                    return;
                }
                if (event.chaveAcesso && (event.bearer || event.refreshToken)) {
                    const updated = this.$accounts.value.map(acc => {
                        const accChave = extractChaveAcessoFromSession(acc);
                        if (accChave === event.chaveAcesso) {
                            return {
                                ...acc,
                                authentication: {
                                    ...acc.authentication,
                                    ...(event.bearer ? { bearer: event.bearer } : {}),
                                    ...(event.refreshToken ? { refreshToken: event.refreshToken } : {}),
                                    chaveAcesso: event.chaveAcesso,
                                },
                            };
                        }
                        return acc;
                    });
                    this.$accounts.next(updated);
                }
            })
        );

        // Escuta revogação remota de sessão via WebSocket globalmente (independente de menus abertos)
        if (this.ws?.sessionRevoked$) {
            this.subscriptions.add(
                this.ws.sessionRevoked$.subscribe(async payload => {
                    if (!payload) return;
                    if (payload.chaveAcesso) {
                        const target = this.$accounts.value.find(
                            a => extractChaveAcessoFromSession(a) === payload.chaveAcesso
                        );
                        if (target) {
                            await this.removerContaLocal(target.id, payload.chaveAcesso);
                            return;
                        }
                        const currentChave = this.ws?.getStoredChaveAcesso();
                        if (currentChave === payload.chaveAcesso) {
                            await this.limparSessaoLocal();
                        }
                    } else {
                        await this.limparSessaoLocal();
                    }
                })
            );
        }

        // Atualiza perfil e foto da conta ativa em segundo plano a partir do servidor
        if (this.authService && this.activeAccount?.authentication?.bearer) {
            this.authService.profile().subscribe({
                next: (profile) => {
                    if (profile && profile.id) {
                        this.atualizarPerfilConta(profile);
                    }
                },
                error: () => { }
            });
        }

        // Renova em segundo plano tokens de contas secundárias que estejam próximos de expirar
        void this.renovarContasSecundarias();

        // Inscreve para persistir e atualizar preferências sempre que o usuário ativo mudar
        this.subscriptions.add(
            this.$user.subscribe(user => {
                try {
                    if (user) {
                        const { ...user_info } = user;
                        if (typeof localStorage !== 'undefined') {
                            const serialized = JSON.stringify(user_info, null, 2);
                            localStorage.setItem(CIUSR_STORAGE_KEY, encodeBase64Utf8(serialized));
                        }
                        this.SetupUserPreferences(user);
                        this.notification?.requestPermission();
                    }
                } catch (error) {
                    console.trace(error);
                }
            })
        );
    }

    get user() {
        return this.$user;
    }

    get accounts() {
        return this.$accounts;
    }

    get accountsList(): ConnectedAccount[] {
        return this.$accounts.value;
    }

    get activeAccount(): ConnectedAccount | undefined {
        return this.$accounts.value.find(acc => acc.isActive) || this.$accounts.value[0];
    }

    getActiveChaveAcesso(): string | undefined {
        return extractChaveAcessoFromSession(this.activeAccount) || this.storage?.restore(USER_STORE_KEY)?.authentication?.chaveAcesso;
    }

    getConnectedChaveAcessos(): string[] {
        return this.$accounts.value
            .map(a => extractChaveAcessoFromSession(a))
            .filter((k): k is string => Boolean(k));
    }

    async hasLocalPrivateKey(chaveAcesso?: string): Promise<boolean> {
        const target = chaveAcesso || this.getActiveChaveAcesso();
        if (!target || !this.accessKeyCrypto) return false;
        return this.accessKeyCrypto.hasPrivateKey(target);
    }

    setAccessScope(scope?: string | string[] | null): void {
        setActiveAccessScope(scope);
    }

    getAccessScope(): string | undefined {
        return getActiveAccessScope();
    }

    private carregarContasDoStorage() {
        if (typeof localStorage === 'undefined') return;

        let accounts: ConnectedAccount[] = readAccountsFromStorage();

        // Se ainda não existia lista de contas em CI_ACCOUNTS, migra a conta já logada
        if (accounts.length === 0) {
            const currentSession = this.storage?.restore(USER_STORE_KEY);
            const currentUser = this.$user.value;

            if (currentUser && currentUser.id) {
                const initialAccount: ConnectedAccount = {
                    id: currentUser.id,
                    user: currentUser,
                    authentication: currentSession?.authentication || {},
                    connectedAt: new Date().toISOString(),
                    isActive: true,
                };
                accounts = [initialAccount];
                this.salvarContasNoStorage(accounts);
            }
        }

        if (accounts.length > 0) {
            const hasActive = accounts.some(a => a.isActive);
            if (!hasActive) {
                accounts[0].isActive = true;
            }

            this.$accounts.next(accounts);
            this.atualizarUsuarioAtivoCombinado(accounts);
        }
    }

    private salvarContasNoStorage(accounts: ConnectedAccount[]) {
        writeAccountsToStorage(accounts);
    }

    private async renovarContasSecundarias() {
        if (!this.authService) return;
        const activeId = this.activeAccount?.id;
        const secondaryAccounts = this.$accounts.value.filter(a => a.id !== activeId);

        for (const acc of secondaryAccounts) {
            const bearer = acc.authentication?.bearer;
            const refreshToken = acc.authentication?.refreshToken;
            const chaveAcesso = extractChaveAcessoFromSession(acc);

            if (refreshToken && !isJwtExpired(refreshToken, 0) && (!bearer || isJwtExpiringSoon(bearer, 60))) {
                try {
                    const res: any = await lastValueFrom(this.authService.refresh({
                        body: {
                            refreshToken,
                            chaveAcesso,
                        } as any,
                    }));
                    if (res?.authorization) {
                        updateAccountTokensInStorage(chaveAcesso, {
                            bearer: res.authorization,
                            refreshToken: res.refreshToken || undefined,
                            chaveAcesso: res.chaveAcesso || chaveAcesso,
                        });
                    }
                } catch {
                    // Conta secundária expirada/revogada não derruba a conta ativa
                }
            }
        }
    }

    private combinarPermissoesEPoliticas(baseUser: User, accounts: ConnectedAccount[]): User {
        const rolesSet = new Set<string>();
        const permissionsMap = new Map<string, Policy>();

        for (const acc of accounts) {
            if (acc.user?.roles && Array.isArray(acc.user.roles)) {
                for (const r of acc.user.roles) {
                    if (r) rolesSet.add(r);
                }
            }
            if (acc.user?.permission && Array.isArray(acc.user.permission)) {
                for (const p of acc.user.permission) {
                    if (p && p.code) {
                        permissionsMap.set(p.code, p);
                    }
                }
            }
        }

        if (baseUser.roles && Array.isArray(baseUser.roles)) {
            for (const r of baseUser.roles) {
                if (r) rolesSet.add(r);
            }
        }
        if (baseUser.permission && Array.isArray(baseUser.permission)) {
            for (const p of baseUser.permission) {
                if (p && p.code) {
                    permissionsMap.set(p.code, p);
                }
            }
        }

        return {
            ...baseUser,
            roles: Array.from(rolesSet),
            permission: Array.from(permissionsMap.values())
        };
    }

    atualizarPerfilConta(profile: User) {
        if (!profile || !profile.id) return;
        const currentAccounts = [...this.$accounts.value];
        let changed = false;

        const updated = currentAccounts.map(acc => {
            if (acc.id === profile.id || acc.user.id === profile.id) {
                changed = true;
                return {
                    ...acc,
                    user: {
                        ...acc.user,
                        ...profile,
                        photo: profile.photo !== undefined ? profile.photo : acc.user.photo
                    }
                };
            }
            return acc;
        });

        if (changed) {
            this.$accounts.next(updated);
            this.salvarContasNoStorage(updated);
            this.atualizarUsuarioAtivoCombinado(updated);
        }
    }

    private atualizarUsuarioAtivoCombinado(accounts: ConnectedAccount[]) {
        const activeAcc = accounts.find(a => a.isActive) || accounts[0];
        if (!activeAcc) {
            this.$user.next(undefined);
            return;
        }

        if (!activeAcc.user.photo && this.$user.value?.photo) {
            activeAcc.user.photo = this.$user.value.photo;
        }

        const combinedUser = this.combinarPermissoesEPoliticas(activeAcc.user, accounts);
        combinedUser.photo = activeAcc.user.photo || this.$user.value?.photo;

        if (this.storage && activeAcc.authentication) {
            this.storage.store(USER_STORE_KEY, {
                authentication: {
                    ...activeAcc.authentication,
                    user: { ...activeAcc.user, photo: null }
                }
            });
        }

        this.$user.next(combinedUser);
    }

    async selecionarConta(userId: string): Promise<boolean> {
        const currentAccounts = [...this.$accounts.value];
        const targetIndex = currentAccounts.findIndex(a => a.id === userId || a.user.id === userId);

        if (targetIndex === -1) {
            console.warn(`Conta ${userId} não encontrada para seleção.`);
            return false;
        }

        const updatedAccounts = currentAccounts.map((acc, index) => ({
            ...acc,
            isActive: index === targetIndex
        }));

        this.$accounts.next(updatedAccounts);
        this.salvarContasNoStorage(updatedAccounts);
        this.atualizarUsuarioAtivoCombinado(updatedAccounts);

        const activeChave = extractChaveAcessoFromSession(updatedAccounts[targetIndex]);
        if (activeChave) {
            this.ws?.identifySession(activeChave);
        }

        return true;
    }

    async adicionarConta(payload: any, userProfile?: User, setActive: boolean = false): Promise<ConnectedAccount> {
        const currentAccounts = [...this.$accounts.value];

        const user: User = userProfile || payload?.user || {
            id: payload?.id || `usr_${Date.now()}`,
            username: payload?.username || payload?.identificacao || 'Usuário',
            roles: payload?.roles || ['USER'],
            permission: payload?.permission || []
        };

        const accountId = user.id || payload?.id || `acc_${Date.now()}`;
        const bearer = payload?.bearer || payload?.authorization || payload?.token;
        const chaveAcesso = payload?.chaveAcesso || extractChaveAcessoFromJwt(bearer);

        const cleanAuthentication: ConnectedAccount['authentication'] = {
            ...(bearer ? { bearer } : {}),
            ...(payload?.refreshToken ? { refreshToken: payload.refreshToken } : {}),
            ...(chaveAcesso ? { chaveAcesso } : {}),
            ...(payload?.mode ? { mode: payload.mode } : {}),
        };

        const shouldBeActive = setActive || currentAccounts.length === 0;
        const newAccount: ConnectedAccount = {
            id: accountId,
            user: { ...user, id: accountId },
            authentication: cleanAuthentication,
            connectedAt: new Date().toISOString(),
            isActive: shouldBeActive
        };

        const existingIdx = currentAccounts.findIndex(a => a.id === accountId || a.user.username === user.username);
        let updatedAccounts: ConnectedAccount[];

        if (existingIdx !== -1) {
            updatedAccounts = currentAccounts.map((a, i) => {
                if (i === existingIdx) {
                    return {
                        ...newAccount,
                        isActive: setActive ? true : a.isActive
                    };
                }
                return setActive ? { ...a, isActive: false } : a;
            });
        } else {
            if (setActive) {
                updatedAccounts = currentAccounts.map(a => ({ ...a, isActive: false }));
                updatedAccounts.push(newAccount);
            } else {
                updatedAccounts = [...currentAccounts, newAccount];
            }
        }

        this.$accounts.next(updatedAccounts);
        this.salvarContasNoStorage(updatedAccounts);
        this.atualizarUsuarioAtivoCombinado(updatedAccounts);

        if (shouldBeActive && chaveAcesso) {
            this.ws?.identifySession(chaveAcesso);
        }

        return newAccount;
    }

    private async removerContaLocal(userId: string, chaveAcessoToDelete?: string): Promise<boolean> {
        const currentAccounts = [...this.$accounts.value];
        const target = currentAccounts.find(a => a.id === userId || a.user.id === userId);
        const chaveToRemove = chaveAcessoToDelete || extractChaveAcessoFromSession(target);

        if (chaveToRemove) {
            await this.accessKeyCrypto?.deleteKey(chaveToRemove);
        }

        const remainingAccounts = currentAccounts.filter(a => a.id !== userId && a.user.id !== userId);
        if (remainingAccounts.length === 0) {
            await this.limparSessaoLocal();
            return true;
        }

        const wasActive = currentAccounts.some(a => (a.id === userId || a.user.id === userId) && a.isActive);
        if (wasActive && remainingAccounts.length > 0) {
            remainingAccounts[0].isActive = true;
        }

        this.$accounts.next(remainingAccounts);
        this.salvarContasNoStorage(remainingAccounts);
        this.atualizarUsuarioAtivoCombinado(remainingAccounts);

        if (wasActive) {
            const nextChave = extractChaveAcessoFromSession(remainingAccounts[0]);
            if (nextChave) {
                this.ws?.identifySession(nextChave);
            }
        }

        return true;
    }

    async removerConta(userId: string): Promise<boolean> {
        const target = this.$accounts.value.find(a => a.id === userId || a.user.id === userId);
        const chaveAcesso = extractChaveAcessoFromSession(target);

        if (chaveAcesso && this.authService) {
            try {
                await lastValueFrom(this.authService.desconectarDispositivo(chaveAcesso as any));
            } catch {
                // Melhor esforço: remove localmente mesmo se a rede falhar
            }
        }

        return this.removerContaLocal(userId, chaveAcesso);
    }

    async identificarUsuario(user: User) {
        let profile = user;
        if (this.authService) {
            try {
                profile = await lastValueFrom(this.authService.profile());
            } catch {
                profile = user;
            }
        }

        const session = this.storage?.restore(USER_STORE_KEY);
        const authData = session?.authentication || {};

        await this.adicionarConta({
            ...authData,
            user: profile
        }, profile, true);
    }

    obterTokensSecundarios(): string[] {
        const activeId = this.activeAccount?.id;
        return this.$accounts.value
            .filter(a => a.id !== activeId && !!a.authentication?.bearer && !isJwtExpired(a.authentication.bearer, 0))
            .map(a => a.authentication.bearer as string);
    }

    async sair() {
        const active = this.activeAccount;
        if (active && this.$accounts.value.length > 1) {
            await this.removerConta(active.id);
        } else {
            await this.sairDeTodasAsContas();
        }
    }

    private async limparSessaoLocal() {
        await this.accessKeyCrypto?.clearAllKeys();
        clearAllAuthStorage();
        this.storage?.clean();
        this.$accounts.next([]);
        this.$user.next(undefined);
        setTimeout(() => this.router?.navigate(['/']));
    }

    async sairDeTodasAsContas() {
        const chaves = this.getConnectedChaveAcessos();
        if (this.authService && chaves.length > 0) {
            for (const chaveAcesso of chaves) {
                try {
                    await lastValueFrom(this.authService.desconectarDispositivo(chaveAcesso as any));
                } catch {
                    // Melhor esforço para revogar cada acesso no servidor
                }
            }
        }
        await this.limparSessaoLocal();
    }

    async obterDispositivos(): Promise<ConnectedDevice[]> {
        if (!this.authService) return [];
        try {
            return await lastValueFrom(this.authService.dispositivos());
        } catch (error) {
            console.error('Erro ao buscar dispositivos vinculados:', error);
            return [];
        }
    }

    async desconectarDispositivo(chaveAcesso: string): Promise<boolean> {
        if (!this.authService) return false;
        try {
            const res: any = await lastValueFrom(this.authService.desconectarDispositivo(chaveAcesso as any));
            if (res?.isCurrent) {
                await this.removerContaLocal(this.activeAccount?.id || '', chaveAcesso);
            }
            return !!res?.success;
        } catch (error) {
            console.error('Erro ao desconectar dispositivo:', error);
            return false;
        }
    }

    async desconectarOutrosDispositivos(): Promise<boolean> {
        if (!this.authService) return false;
        try {
            const res: any = await lastValueFrom(this.authService.desconectarOutrosDispositivos());
            return !!res?.success;
        } catch (error) {
            console.error('Erro ao desconectar outros dispositivos:', error);
            return false;
        }
    }

    private async SetupUserPreferences(user: User) {
        // TODO: get user preferences
    }
}
