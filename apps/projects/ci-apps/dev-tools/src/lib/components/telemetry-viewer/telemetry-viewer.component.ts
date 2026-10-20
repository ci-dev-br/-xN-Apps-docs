import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription, interval } from 'rxjs';
import { DevToolsTelemetryService } from '../../services/dev-tools-telemetry.service';
import { TelemetryPoint, TelemetrySummary } from '../../models/system-telemetry.model';

@Component({
    selector: 'ci-telemetry-viewer',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatProgressBarModule,
        MatTooltipModule,
    ],
    templateUrl: './telemetry-viewer.component.html',
    styleUrls: ['./telemetry-viewer.component.scss'],
})
export class TelemetryViewerComponent implements OnInit, OnDestroy {
    public summary: TelemetrySummary = {
        currentHeapPercent: 0,
        currentCpuPercent: 0,
        heapUsedFormatted: '0 MB',
        heapTotalFormatted: '0 MB',
        rssFormatted: '0 MB',
        history: [],
        isStressed: false,
    };

    public isPolling: boolean = true;
    public pollIntervalSec: number = 3;
    private timerSub?: Subscription;

    constructor(private readonly telemetryService: DevToolsTelemetryService) {}

    ngOnInit(): void {
        this.fetchData();
        this.startPolling();
    }

    ngOnDestroy(): void {
        this.stopPolling();
    }

    public fetchData(): void {
        this.telemetryService.fetchTelemetry().subscribe((res) => {
            this.summary = res;
        });
    }

    public togglePolling(): void {
        this.isPolling = !this.isPolling;
        if (this.isPolling) {
            this.startPolling();
        } else {
            this.stopPolling();
        }
    }

    private startPolling(): void {
        this.stopPolling();
        this.timerSub = interval(this.pollIntervalSec * 1000).subscribe(() => {
            if (this.isPolling) {
                this.fetchData();
            }
        });
    }

    private stopPolling(): void {
        if (this.timerSub) {
            this.timerSub.unsubscribe();
            this.timerSub = undefined;
        }
    }

    public getProgressBarColor(percent: number): 'primary' | 'accent' | 'warn' {
        if (percent >= 85) return 'warn';
        if (percent >= 70) return 'accent';
        return 'primary';
    }
}
