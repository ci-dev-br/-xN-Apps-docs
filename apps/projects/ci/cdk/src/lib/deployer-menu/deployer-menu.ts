import { CommonModule } from "@angular/common";
import { Component, OnDestroy, Optional, signal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { AvailableVersionInfoDto, DeployerService } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";

@Component({
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
    ],
    templateUrl: 'deployer-menu.html'
})
export class DeployerMenu implements OnDestroy {
    versionInfo = signal<AvailableVersionInfoDto | undefined>(undefined);
    loadingVersion = signal<boolean>(false);
    publishing = signal<boolean>(false);
    lastActionMessage = signal<string | undefined>(undefined);
    private pollTimer: any = null;

    constructor(
        @Optional() private readonly deployerService?: DeployerService,
    ) { }

    ngOnDestroy(): void {
        if (this.pollTimer) {
            clearTimeout(this.pollTimer);
            this.pollTimer = null;
        }
    }

    async carregarVersaoDisponivel(event?: Event) {
        if (event) {
            event.stopPropagation();
        }
        if (!this.deployerService) return;

        this.loadingVersion.set(true);
        try {
            const info = await lastValueFrom(this.deployerService.getVersion());
            this.versionInfo.set(info);

            if (this.pollTimer) {
                clearTimeout(this.pollTimer);
                this.pollTimer = null;
            }
            if (info?.publishStatus === 'running') {
                this.pollTimer = setTimeout(() => this.carregarVersaoDisponivel(), 2500);
            }
        } catch (error) {
            console.trace(error);
        } finally {
            this.loadingVersion.set(false);
        }
    }

    async publicarVersao(
        action: 'gulp' | 'server-build' | 'full-publish' | 'sync-git' = 'gulp',
        event?: Event
    ) {
        if (event) {
            event.stopPropagation();
        }
        if (!this.deployerService) return;

        this.publishing.set(true);
        try {
            const res = await lastValueFrom(
                this.deployerService.publish({ body: { action } })
            );
            this.lastActionMessage.set(res?.mensagem || 'Ação de publicação enviada.');
            await this.carregarVersaoDisponivel();
        } catch (error: any) {
            console.trace(error);
            this.lastActionMessage.set(error?.error?.message || error?.message || 'Erro ao acionar publicação.');
        } finally {
            this.publishing.set(false);
        }
    }
}