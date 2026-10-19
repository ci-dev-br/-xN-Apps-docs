import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { Subscription } from 'rxjs';
import { DevToolTab } from '../../models/dev-tools.model';
import { LogSummaryStats } from '../../models/log.model';
import { TelemetrySummary } from '../../models/system-telemetry.model';
import { DevToolsService } from '../../dev-tools.service';
import { DevToolsTelemetryService } from '../../services/dev-tools-telemetry.service';
import { LogViewerComponent } from '../../components/log-viewer/log-viewer.component';
import { TelemetryViewerComponent } from '../../components/telemetry-viewer/telemetry-viewer.component';
import { DiskLogsViewerComponent } from '../../components/disk-logs-viewer/disk-logs-viewer.component';
import { EnvironmentViewerComponent } from '../../components/environment-viewer/environment-viewer.component';
import { LogSimulatorComponent } from '../../components/log-simulator/log-simulator.component';

@Component({
    selector: 'ci-home',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatTabsModule,
        MatBadgeModule,
        LogViewerComponent,
        TelemetryViewerComponent,
        DiskLogsViewerComponent,
        EnvironmentViewerComponent,
        LogSimulatorComponent,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
    public activeTab: DevToolTab = 'logs';
    public autoRefresh: boolean = true;
    public lastUpdated: Date = new Date();

    public stats: LogSummaryStats = {
        total: 0,
        errors: 0,
        warns: 0,
        toFix: 0,
        resolved: 0,
        alertsTriggered: 0,
    };

    public telemetrySummary?: TelemetrySummary;
    private subs = new Subscription();

    constructor(
        public readonly devToolsService: DevToolsService,
        private readonly telemetryService: DevToolsTelemetryService,
    ) {}

    ngOnInit(): void {
        this.subs.add(
            this.devToolsService.activeTab$.subscribe((tab) => {
                this.activeTab = tab;
            })
        );

        this.subs.add(
            this.devToolsService.autoRefresh$.subscribe((enabled) => {
                this.autoRefresh = enabled;
            })
        );

        this.subs.add(
            this.devToolsService.stats$.subscribe((stats) => {
                this.stats = stats;
                this.lastUpdated = new Date();
            })
        );

        this.subs.add(
            this.telemetryService.summary$.subscribe((summary) => {
                this.telemetrySummary = summary;
            })
        );

        this.telemetryService.fetchTelemetry().subscribe();
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    public switchTab(tab: DevToolTab): void {
        this.devToolsService.setActiveTab(tab);
    }

    public toggleAutoRefresh(): void {
        this.devToolsService.setAutoRefresh(!this.autoRefresh);
    }

    public refreshAll(): void {
        this.devToolsService.triggerRefresh();
        this.telemetryService.fetchTelemetry().subscribe();
        this.lastUpdated = new Date();
    }
}
