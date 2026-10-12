export interface StatusHistoryEntry {
    status: 'running' | 'online' | 'fail' | 'stopped' | 'port_in_use';
    timestamp: string;
    port?: number;
    reason?: string;
}
export interface StatusHistoryEntry {
    status: 'running' | 'online' | 'fail' | 'stopped' | 'port_in_use';
    timestamp: string;
    port?: number;
    reason?: string;
}
