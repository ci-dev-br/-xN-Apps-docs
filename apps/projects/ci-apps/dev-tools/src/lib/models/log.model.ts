export enum LogLevel {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug',
    TRACE = 'trace',
    FATAL = 'fatal',
}

export enum LogStatus {
    NEW = 'NOVO',
    PENDING = 'PENDENTE',
    IN_PROGRESS = 'EM_ANALISE',
    RESOLVED = 'CORRIGIDO',
    IGNORED = 'IGNORADO',
}

export interface SystemLog {
    internalId: string;
    chaveAcessoReference?: string;
    userId?: string;
    userEmail?: string;
    userRoles?: string[];
    userCredentials?: {
        id?: string;
        username?: string;
        email?: string;
        roles?: string[];
        chaveAcesso?: string;
        permissions?: any;
        ip?: string;
        userAgent?: string;
        [key: string]: any;
    };
    message?: string;
    log?: any;
    level?: LogLevel | string;
    origem?: string;
    application?: string;
    status?: LogStatus | string;
    deveCorrigir?: boolean;
    dispararAlerta?: boolean;
    alertaDisparado?: boolean;
    alertDetails?: any;
    metadata?: {
        url?: string;
        method?: string;
        statusCode?: number;
        ip?: string;
        userAgent?: string;
        timestamp?: string;
        [key: string]: any;
    };
    cratedAt?: Date | string;
    updatedAt?: Date | string;
}

export interface QueryLogDto {
    level?: string;
    origem?: string;
    application?: string;
    status?: string;
    deveCorrigir?: boolean;
    dispararAlerta?: boolean;
    alertaDisparado?: boolean;
    userId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}

export interface QueryLogResponse {
    items: SystemLog[];
    total: number;
    limit: number;
    offset: number;
}

export interface UpdateLogStateDto {
    internalId: string;
    status?: string;
    deveCorrigir?: boolean;
    dispararAlerta?: boolean;
    alertaDisparado?: boolean;
    alertDetails?: any;
}

export interface TriggerAlertDto {
    internalId: string;
    reason?: string;
    channels?: string[];
    extraDetails?: any;
}

export interface CreateLogDto {
    message?: string;
    log: any;
    level?: string;
    origem?: string;
    application?: string;
    chaveAcessoReference?: string;
    userId?: string;
    userEmail?: string;
    userRoles?: string[];
    userCredentials?: any;
    status?: string;
    deveCorrigir?: boolean;
    dispararAlerta?: boolean;
    alertaDisparado?: boolean;
    alertDetails?: any;
    metadata?: any;
}

export interface LogSummaryStats {
    total: number;
    errors: number;
    warns: number;
    toFix: number;
    resolved: number;
    alertsTriggered: number;
}
