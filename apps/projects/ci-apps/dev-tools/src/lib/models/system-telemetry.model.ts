export interface CpuInfo {
    system?: number | null;
    user?: number | null;
    momento?: Date | string | null;
    heapTotal?: number | null;
    heapUsed?: number | null;
    rss?: number | null;
    external?: number | null;
}

export interface TelemetryPoint {
    timestamp: Date;
    cpuUserMs: number;
    cpuSystemMs: number;
    cpuEstimatedLoadPercent: number;
    heapUsedMb: number;
    heapTotalMb: number;
    heapPercentage: number;
    rssMb: number;
    externalMb: number;
}

export interface TelemetrySummary {
    latest?: TelemetryPoint;
    currentHeapPercent: number;
    currentCpuPercent: number;
    heapUsedFormatted: string;
    heapTotalFormatted: string;
    rssFormatted: string;
    history: TelemetryPoint[];
    isStressed: boolean;
}
