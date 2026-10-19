import { InjectionToken } from '@angular/core';

export type DevToolTab = 'logs' | 'telemetry' | 'disk-logs' | 'environment' | 'simulator';

export interface DevToolModuleInfo {
    id: string;
    name: string;
    category: string;
    version: string;
    description: string;
    status: 'active' | 'beta' | 'stable';
    icon: string;
}

export interface SystemHealthInfo {
    status: 'healthy' | 'warning' | 'critical';
    environment: string;
    branch: string;
    commit: string;
    author: string;
    builtAt: string;
    nodeVersion?: string;
    apiEndpoint?: string;
}

export interface DiskLogFileInfo {
    name: string;
    path: string;
    size: number;
    sizeFormatted: string;
    type: 'trace' | 'log' | 'info' | 'other';
    mtime: Date | string;
}

export interface DevToolsApiConfig {
    rootUrl?: string;
}

export const DEVTOOLS_API_CONFIG = new InjectionToken<DevToolsApiConfig>('DEVTOOLS_API_CONFIG');
