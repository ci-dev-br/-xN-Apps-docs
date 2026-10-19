import { Component, forwardRef, Inject, OnDestroy, OnInit, Optional } from "@angular/core";
import { UserPhoto } from "../user-photo/user-photo";
import { CommonModule } from "@angular/common";
import { UserAuthenticationService } from "../../services/user-authentication-user.service";
import { MatButtonModule } from "@angular/material/button";
import { MatExpansionModule } from "@angular/material/expansion";
import { RouterModule } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { ConnectedDevice, User } from "@ci/portal-api";
import { WsService } from "@ci/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ConnectedAccount } from "../../models/connected-account";
import { AddAccountDialog } from "../add-account-dialog/add-account-dialog";
import { formatUserPhotoUrl } from "../../utils/photo.utils";

/**
 * Menu de perfil do usuário.
 * 
 * Exibe informações da conta ativa, gerenciamento de dispositivos vinculados
 * e controle multi-contas simultâneas ("Mostrar mais contas" > "Adicionar outra conta"),
 * permitindo ao cliente alternar qual usuário realiza ações e combinando permissões/políticas.
 */
@Component({
    selector: 'ci-profile-menu',
    templateUrl: './profile-menu.html',
    styleUrls: ['./profile-menu.scss'],
    standalone: true,
    imports: [
        UserPhoto,
        MatButtonModule,
        CommonModule,
        RouterModule,
        MatIconModule,
        MatExpansionModule,
        MatTooltipModule,
        MatDialogModule,
        MatSnackBarModule,
    ]
})
export class ProfileMenu implements OnInit, OnDestroy {
    protected user = this.users?.user;
    public accounts$ = this.users?.accounts;
    public devices: ConnectedDevice[] = [];
    public loadingDevices = false;
    private destroy$ = new Subject<void>();

    constructor(
        @Optional() @Inject(forwardRef(() => UserAuthenticationService)) public readonly users?: UserAuthenticationService,
        @Optional() private readonly ws?: WsService,
        @Optional() private readonly dialog?: MatDialog,
        @Optional() private readonly snackBar?: MatSnackBar,
    ) { }

    ngOnInit(): void {
        this.loadDevices();

        // Escuta atualizações de status online/offline de dispositivos pelo WebSocket
        this.ws?.deviceStatus$
            ?.pipe(takeUntil(this.destroy$))
            ?.subscribe(status => {
                if (!status) return;
                const dev = this.devices.find(d => d.id === status.chaveAcesso);
                if (dev) {
                    dev.isOnline = status.isOnline;
                }
            });

        // Escuta revogação de sessão remota
        this.ws?.sessionRevoked$
            ?.pipe(takeUntil(this.destroy$))
            ?.subscribe(async payload => {
                if (!payload) return;
                const currentChave = this.ws?.getStoredChaveAcesso();
                if (!payload.chaveAcesso || payload.chaveAcesso === currentChave) {
                    await this.users?.sair();
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    async loadDevices() {
        if (!this.users) return;
        this.loadingDevices = true;
        try {
            this.devices = await this.users.obterDispositivos();
        } finally {
            this.loadingDevices = false;
        }
    }

    get hasOtherDevices(): boolean {
        return this.devices.some(d => !d.isCurrent);
    }

    getDeviceIcon(device: ConnectedDevice): string {
        switch (device?.deviceType) {
            case 'mobile':
                return 'smartphone';
            case 'tablet':
                return 'tablet';
            case 'desktop':
            default:
                return 'laptop';
        }
    }

    /**
     * Alterna a conta ativa do cliente para realizar ações.
     */
    async alternarConta(account: ConnectedAccount, event?: Event) {
        event?.stopPropagation();
        if (!this.users) return;

        if (account.isActive) return;

        const success = await this.users.selecionarConta(account.id);
        if (success) {
            const name = account.user.surname || account.user.fullName || account.user.username || 'Conta';
            this.snackBar?.open(`Agora realizando ações como: ${name}`, 'Ok', {
                duration: 3500,
            });
        }
    }

    /**
     * Desconecta uma conta específica mantendo as demais conectadas.
     */
    async desconectarConta(account: ConnectedAccount, event?: Event) {
        event?.stopPropagation();
        if (!this.users) return;

        const name = account.user.surname || account.user.fullName || account.user.username || 'esta conta';
        const confirmed = confirm(`Deseja desconectar a conta "${name}"?`);
        if (!confirmed) return;

        await this.users.removerConta(account.id);
        this.snackBar?.open(`Conta "${name}" desconectada.`, 'Ok', { duration: 3000 });
    }

    /**
     * Abre o diálogo modal para autenticar e adicionar outra conta simultaneamente.
     */
    abrirAdicionarConta(event?: Event) {
        event?.stopPropagation();
        if (!this.dialog) {
            alert('Gerenciador de diálogos indisponível.');
            return;
        }

        const dialogRef = this.dialog.open(AddAccountDialog, {
            width: '420px',
            maxWidth: '95vw',
            panelClass: 'ci-dialog-dark-panel',
            disableClose: false,
        });

        dialogRef.afterClosed().subscribe((newAccount?: ConnectedAccount) => {
            if (newAccount) {
                // Diálogo já tratou adição e snackbar
            }
        });
    }

    /**
     * Encerra a sessão de todas as contas simultaneamente.
     */
    async sairDeTodasAsContas(event?: Event) {
        event?.stopPropagation();
        if (!this.users) return;

        const confirmed = confirm('Deseja realmente sair de todas as contas conectadas?');
        if (!confirmed) return;

        await this.users.sairDeTodasAsContas();
    }

    /**
     * Retorna iniciais para avatar alternativo quando usuário não possui foto.
     */
    getAccountInitials(user?: User): string {
        if (!user) return '?';
        const name = user.surname || user.fullName || user.username || '';
        const parts = name.trim().split(' ').filter(Boolean);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase() || '?';
    }

    failedAccountPhotos = new Set<string>();

    onAccountPhotoError(accId: string) {
        this.failedAccountPhotos.add(accId);
    }

    /**
     * Retorna imagem formatada (data URI ou URL) da foto do usuário se existir.
     */
    getAccountPhoto(user?: User, accId?: string): string | null {
        if (!user || (accId && this.failedAccountPhotos.has(accId))) return null;
        const photo = user.photo || (user.id === this.users?.user.value?.id ? this.users?.user.value?.photo : null);
        return formatUserPhotoUrl(photo);
    }

    /**
     * Retorna lista deduplicada de roles combinadas ativas no momento.
     */
    get combinedRoles(): string[] {
        const u = this.users?.user.value;
        return Array.isArray(u?.roles) ? u.roles : [];
    }

    async desconectar(device: ConnectedDevice, event?: Event) {
        event?.stopPropagation();
        if (!this.users) return;
        const deviceName = device.browser && device.os ? `${device.browser} no ${device.os}` : 'este dispositivo';
        const confirmed = confirm(`Deseja desconectar o dispositivo "${deviceName}"?`);
        if (!confirmed) return;

        const success = await this.users.desconectarDispositivo(device.id);
        if (success) {
            if (!device.isCurrent) {
                this.devices = this.devices.filter(d => d.id !== device.id);
            }
        }
    }

    async desconectarOutros(event?: Event) {
        event?.stopPropagation();
        if (!this.users) return;
        const otherCount = this.devices.filter(d => !d.isCurrent).length;
        if (otherCount === 0) return;

        const confirmed = confirm(`Deseja desconectar todos os outros ${otherCount} dispositivo(s)?`);
        if (!confirmed) return;

        const success = await this.users.desconectarOutrosDispositivos();
        if (success) {
            this.devices = this.devices.filter(d => d.isCurrent);
        }
    }
}