import { Inject, Injectable, Optional, PLATFORM_ID } from "@angular/core";
import { AuthService, ConnectedDevice, Policy, User } from "@ci/portal-api";
import { BehaviorSubject, lastValueFrom } from "rxjs";
import { Router } from "@angular/router";
import { StorageService, NotificationService } from "@ci/core";
import { isPlatformBrowser } from "@angular/common";
import { ConnectedAccount } from "../models/connected-account";

const ACCOUNTS_STORAGE_KEY = 'CI_ACCOUNTS';
const USER_STORE_KEY = 'apps.ci.dev.br.store.User';

@Injectable()
export class UserAuthenticationService {
    private isBrowser: boolean;

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
            const stored = localStorage.getItem('CIUSR');
            try {
                if (stored) {
                    try {
                        return JSON.parse(decodeURIComponent(escape(atob(stored))));
                    } catch {
                        return JSON.parse(atob(stored));
                    }
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
    ) {
        this.isBrowser = isPlatformBrowser(this.platformId);
        if (!this.isBrowser) return;
        this.init();
    }

    /**
     * Inicializa o gerenciador multi-contas e permissões combinadas.
     */
    async init() {
        this.carregarContasDoStorage();

        // Inscreve para persistir e atualizar preferências sempre que o usuário ativo mudar
        this.$user.subscribe(user => {
            try {
                if (user) {
                    const { ...user_info } = user;
                    if (typeof localStorage !== 'undefined') {
                        try {
                            const serialized = JSON.stringify(user_info, null, 2);
                            const encoded = btoa(unescape(encodeURIComponent(serialized)));
                            localStorage.setItem('CIUSR', encoded);
                        } catch {
                            localStorage.setItem('CIUSR', btoa(JSON.stringify(user_info)));
                        }
                    }
                    this.SetupUserPreferences(user);
                    this.notification?.requestPermission();
                }
            } catch (error) {
                console.trace(error);
            }
        });

        // Atualiza perfil e foto da conta ativa em segundo plano a partir do servidor
        if (this.authService && this.activeAccount?.authentication?.bearer) {
            this.authService.profile().subscribe({
                next: (profile) => {
                    if (profile && profile.id) {
                        this.atualizarPerfilConta(profile);
                    }
                },
                error: () => {}
            });
        }
    }

    /** 
     * Retorna o usuário ativo (com permissões e políticas combinadas) como Observable.
     */
    get user() {
        return this.$user;
    }

    /**
     * Retorna o Observable com a lista de contas conectadas simultaneamente.
     */
    get accounts() {
        return this.$accounts;
    }

    /**
     * Retorna snapshot da lista de contas conectadas.
     */
    get accountsList(): ConnectedAccount[] {
        return this.$accounts.value;
    }

    /**
     * Retorna a conta atualmente ativa.
     */
    get activeAccount(): ConnectedAccount | undefined {
        return this.$accounts.value.find(acc => acc.isActive) || this.$accounts.value[0];
    }

    /**
     * Carrega as contas persistidas e unifica políticas e permissões.
     */
    private carregarContasDoStorage() {
        if (typeof localStorage === 'undefined') return;

        let accounts: ConnectedAccount[] = [];
        const rawAccounts = localStorage.getItem(ACCOUNTS_STORAGE_KEY);

        if (rawAccounts) {
            try {
                let parsed: any;
                try {
                    parsed = JSON.parse(decodeURIComponent(escape(atob(rawAccounts))));
                } catch {
                    parsed = JSON.parse(atob(rawAccounts));
                }
                if (Array.isArray(parsed)) {
                    accounts = parsed;
                }
            } catch (e) {
                console.error('Falha ao restaurar contas conectadas:', e);
            }
        }

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
            // Garante que exatamente uma conta seja a ativa
            let hasActive = accounts.some(a => a.isActive);
            if (!hasActive) {
                accounts[0].isActive = true;
            }

            this.$accounts.next(accounts);
            this.atualizarUsuarioAtivoCombinado(accounts);
        }
    }

    /**
     * Salva a lista de contas conectadas no localStorage.
     */
    private salvarContasNoStorage(accounts: ConnectedAccount[]) {
        if (typeof localStorage === 'undefined') return;
        try {
            const serialized = JSON.stringify(accounts, null, 2);
            const encoded = btoa(unescape(encodeURIComponent(serialized)));
            localStorage.setItem(ACCOUNTS_STORAGE_KEY, encoded);
        } catch {
            localStorage.setItem(ACCOUNTS_STORAGE_KEY, btoa(JSON.stringify(accounts)));
        }
    }

    /**
     * Unifica papéis (roles) e políticas (permission) de todas as contas conectadas,
     * aplicando-as sobre o usuário ativo selecionado.
     */
    private combinarPermissoesEPoliticas(baseUser: User, accounts: ConnectedAccount[]): User {
        const rolesSet = new Set<string>();
        const permissionsMap = new Map<string, Policy>();

        for (const acc of accounts) {
            // Unir roles de todas as contas conectadas
            if (acc.user?.roles && Array.isArray(acc.user.roles)) {
                for (const r of acc.user.roles) {
                    if (r) rolesSet.add(r);
                }
            }
            // Unir políticas/permissões de todas as contas conectadas
            if (acc.user?.permission && Array.isArray(acc.user.permission)) {
                for (const p of acc.user.permission) {
                    if (p && p.code) {
                        permissionsMap.set(p.code, p);
                    }
                }
            }
        }

        // Garante inclusão das roles e policies do usuário base
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

    /**
     * Atualiza o perfil e foto de uma conta específica na lista de contas.
     */
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

    /**
     * Atualiza o usuário emitido para a aplicação com permissões combinadas de todas as contas,
     * mantendo a identidade e sessão da conta ativa selecionada.
     */
    private atualizarUsuarioAtivoCombinado(accounts: ConnectedAccount[]) {
        const activeAcc = accounts.find(a => a.isActive) || accounts[0];
        if (!activeAcc) {
            this.$user.next(undefined);
            return;
        }

        // Garante que a foto do usuário seja preservada na conta ativa
        if (!activeAcc.user.photo && this.$user.value?.photo) {
            activeAcc.user.photo = this.$user.value.photo;
        }

        const combinedUser = this.combinarPermissoesEPoliticas(activeAcc.user, accounts);
        combinedUser.photo = activeAcc.user.photo || this.$user.value?.photo;

        // Atualiza a chave de sessão ativa consumida por interceptors HTTP e WebSockets
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

    /**
     * Alterna a conta ativa: permite ao usuário escolher qual usuário está realizando a ação.
     * As permissões e políticas de acesso continuam combinadas de todas as contas conectadas.
     * 
     * @param userId ID do usuário da conta a ser ativada
     */
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

        return true;
    }

    /**
     * Conecta e adiciona uma nova conta simultânea à sessão do cliente.
     * Suas permissões e políticas serão unificadas com as contas já existentes.
     * 
     * @param payload Resposta de autenticação contendo tokens e dados do usuário
     * @param userProfile Perfil completo do usuário (opcional)
     * @param setActive Define se a nova conta deve se tornar imediatamente a conta ativa
     */
    async adicionarConta(payload: any, userProfile?: User, setActive: boolean = false): Promise<ConnectedAccount> {
        const currentAccounts = [...this.$accounts.value];

        const user: User = userProfile || payload?.user || {
            id: payload?.id || `usr_${Date.now()}`,
            username: payload?.username || payload?.identificacao || 'Usuário',
            roles: payload?.roles || ['USER'],
            permission: payload?.permission || []
        };

        const accountId = user.id || payload?.id || `acc_${Date.now()}`;

        const newAccount: ConnectedAccount = {
            id: accountId,
            user: { ...user, id: accountId },
            authentication: {
                bearer: payload.bearer || payload.authorization || payload.token,
                refreshToken: payload.refreshToken,
                chaveAcesso: payload.chaveAcesso,
                mode: payload.mode,
                ...payload
            },
            connectedAt: new Date().toISOString(),
            isActive: setActive || currentAccounts.length === 0
        };

        // Se a conta já existia na lista, substitui; caso contrário, adiciona
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

        return newAccount;
    }

    /**
     * Desconecta e remove uma conta específica da lista de contas conectadas.
     * Se a conta removida for a conta ativa, seleciona outra conta automaticamente.
     * 
     * @param userId ID do usuário a desconectar
     */
    async removerConta(userId: string): Promise<boolean> {
        const currentAccounts = [...this.$accounts.value];
        const remainingAccounts = currentAccounts.filter(a => a.id !== userId && a.user.id !== userId);

        if (remainingAccounts.length === 0) {
            // Nenhuma conta restante: encerra completamente a sessão
            await this.sairDeTodasAsContas();
            return true;
        }

        // Se a conta removida era a ativa, ativa a primeira das contas restantes
        const wasActive = currentAccounts.some(a => (a.id === userId || a.user.id === userId) && a.isActive);
        if (wasActive && remainingAccounts.length > 0) {
            remainingAccounts[0].isActive = true;
        }

        this.$accounts.next(remainingAccounts);
        this.salvarContasNoStorage(remainingAccounts);
        this.atualizarUsuarioAtivoCombinado(remainingAccounts);

        return true;
    }

    /**
     * Identifica o usuário atual no sistema (chamado no login inicial da aplicação).
     */
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

    /**
     * Retorna os tokens bearer das contas adicionais conectadas (exceto a conta ativa).
     * Usado pelo interceptor HTTP para enviar tokens complementares.
     */
    obterTokensSecundarios(): string[] {
        const activeId = this.activeAccount?.id;
        return this.$accounts.value
            .filter(a => a.id !== activeId && !!a.authentication?.bearer)
            .map(a => a.authentication.bearer as string);
    }

    /**
     * Encerra a sessão da conta ativa atual.
     * Se houver outras contas conectadas, transfere o controle para a próxima conta.
     */
    async sair() {
        const active = this.activeAccount;
        if (active && this.$accounts.value.length > 1) {
            await this.removerConta(active.id);
        } else {
            await this.sairDeTodasAsContas();
        }
    }

    /**
     * Encerra a sessão de todas as contas simultaneamente e redireciona para a página inicial.
     */
    async sairDeTodasAsContas() {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(ACCOUNTS_STORAGE_KEY);
            localStorage.removeItem('CIUSR');
        }
        this.storage?.clean();
        this.$accounts.next([]);
        this.$user.next(undefined);
        setTimeout(() => this.router?.navigate(['/']));
    }

    /**
     * Obtém os dispositivos vinculados à conta do usuário.
     */
    async obterDispositivos(): Promise<ConnectedDevice[]> {
        if (!this.authService) return [];
        try {
            return await lastValueFrom(this.authService.dispositivos());
        } catch (error) {
            console.error('Erro ao buscar dispositivos vinculados:', error);
            return [];
        }
    }

    /**
     * Desconecta um dispositivo individual pelo ID da chave de acesso.
     */
    async desconectarDispositivo(chaveAcesso: string): Promise<boolean> {
        if (!this.authService) return false;
        try {
            const res = await lastValueFrom(this.authService.desconectarDispositivo(chaveAcesso));
            if (res.isCurrent) {
                await this.sair();
            }
            return !!res.success;
        } catch (error) {
            console.error('Erro ao desconectar dispositivo:', error);
            return false;
        }
    }

    /**
     * Desconecta todos os outros dispositivos vinculados, mantendo a sessão atual.
     */
    async desconectarOutrosDispositivos(): Promise<boolean> {
        if (!this.authService) return false;
        try {
            const res = await lastValueFrom(this.authService.desconectarOutrosDispositivos());
            return !!res.success;
        } catch (error) {
            console.error('Erro ao desconectar outros dispositivos:', error);
            return false;
        }
    }

    private async SetupUserPreferences(user: User) {
        // TODO: get user preferences
    }
}