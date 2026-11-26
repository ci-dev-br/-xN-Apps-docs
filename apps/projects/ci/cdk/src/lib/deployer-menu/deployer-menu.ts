import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, Optional, signal } from "@angular/core";
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
    templateUrl: 'deployer-menu.html',
    styles: [`
        .deployer-panel {
            padding: 8px 14px;
            border-bottom: 1px solid rgba(128, 128, 128, 0.25);
            font-size: 12px;
            line-height: 1.45;
            min-width: 280px;
            max-width: 360px;
        }
        .deployer-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 6px;
        }
        .deployer-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .deployer-msg {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .deployer-sub {
            font-size: 11px;
            opacity: 0.8;
        }
        .env-badge {
            display: inline-block;
            padding: 1px 6px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 11px;
            background: rgba(46, 125, 50, 0.2);
        }
        .env-badge.debug {
            background: rgba(245, 124, 0, 0.25);
        }
        .deployer-feedback {
            margin-top: 4px;
            padding: 4px 6px;
            border-radius: 4px;
            background: rgba(33, 150, 243, 0.15);
            font-size: 11px;
        }
        .deployer-logs {
            margin: 4px 0 0;
            padding: 6px;
            border-radius: 4px;
            background: rgba(0, 0, 0, 0.25);
            font-size: 10px;
            overflow: auto;
            white-space: pre-wrap;
        }
    `],
})
export class DeployerMenu implements OnInit, OnDestroy {
    versionInfo = signal<AvailableVersionInfoDto | undefined>(undefined);
    loadingVersion = signal<boolean>(false);
    publishing = signal<boolean>(false);
    lastActionMessage = signal<string | undefined>(undefined);
    private pollTimer: any = null;

    constructor(
        @Optional() private readonly deployerService?: DeployerService,
    ) { }

    ngOnInit(): void {
        this.carregarVersaoDisponivel();
    }

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