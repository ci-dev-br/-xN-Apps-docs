import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, FindOptionsWhere, Like, Repository } from "typeorm";
import { Log, LogLevel, LogStatus } from "./log.entity";
import { CreateLogDto, QueryLogDto, TriggerAlertDto, UpdateLogStateDto } from "./dto/log.dto";

@Injectable()
export class LoggerService {
    public static instance: LoggerService | null = null;

    constructor(
        @InjectRepository(Log)
        private readonly logRepository: Repository<Log>,
    ) {
        LoggerService.instance = this;
    }

    public static getInstance(): LoggerService | null {
        return LoggerService.instance;
    }

    /**
     * Extrai credenciais de acesso e dados do usuário da requisição
     */
    public extractCredentialsFromRequest(req: any) {
        if (!req) return null;
        const user = req.user;
        const chaveAcesso = req.chaveAcesso || req.headers?.['authorization'] || req.headers?.['chave-acesso'];
        const ip = req.ip ||
            req.headers?.['x-forwarded-for'] ||
            req.headers?.['cf-connecting-ip'] ||
            req.connection?.remoteAddress;
        const userAgent = req.headers?.['user-agent'];

        return {
            id: user?.id,
            username: user?.username || user?.nome,
            email: user?.email,
            roles: user?.roles || [],
            chaveAcesso: chaveAcesso ? String(chaveAcesso).replace('Bearer ', '') : undefined,
            permissions: user?.permissions,
            ip: ip ? String(ip) : undefined,
            userAgent: userAgent ? String(userAgent) : undefined,
        };
    }

    /**
     * Registra um novo log catalogado na entidade Log
     */
    async register(data: CreateLogDto, req?: any): Promise<Log> {
        try {
            const reqCreds = this.extractCredentialsFromRequest(req);
            const userCredentials = {
                ...(reqCreds || {}),
                ...(data.userCredentials || {}),
            };

            const userId = data.userId || userCredentials.id;
            const userEmail = data.userEmail || userCredentials.email;
            const userRoles = data.userRoles || userCredentials.roles;
            const chaveAcessoReference = data.chaveAcessoReference || userCredentials.chaveAcesso;

            const level = data.level || LogLevel.INFO;
            const origem = data.origem || (req ? 'SERVER' : 'CLIENT');
            const status = data.status || LogStatus.NEW;

            // Determina se deve ser corrigido caso não tenha sido informado
            let deveCorrigir = data.deveCorrigir;
            if (deveCorrigir === undefined || deveCorrigir === null) {
                deveCorrigir = level === LogLevel.ERROR || level === LogLevel.FATAL;
            }

            // Determina se deve disparar alerta caso não tenha sido informado
            let dispararAlerta = data.dispararAlerta;
            if (dispararAlerta === undefined || dispararAlerta === null) {
                dispararAlerta = level === LogLevel.FATAL || (level === LogLevel.ERROR && deveCorrigir === true);
            }

            let alertaDisparado = data.alertaDisparado ?? false;
            let alertDetails = data.alertDetails || null;

            // Se deve disparar alerta e ainda não foi disparado, aciona o alerta e cataloga os detalhes
            if (dispararAlerta && !alertaDisparado) {
                alertDetails = {
                    triggeredAt: new Date().toISOString(),
                    severity: level,
                    reason: data.message || 'Alerta automático disparado por ocorrência de erro crítico.',
                    origin: origem,
                    application: data.application,
                    notifiedRoles: ['MASTER', 'ADMIN'],
                    ...(data.alertDetails || {}),
                };
                alertaDisparado = true;
                this.notifyMasterAlert(data.message, alertDetails);
            }

            const metadata = {
                ...(data.metadata || {}),
                ip: data.metadata?.ip || userCredentials.ip,
                userAgent: data.metadata?.userAgent || userCredentials.userAgent,
                registeredAt: new Date().toISOString(),
            };

            const logEntity = this.logRepository.create({
                message: data.message || (typeof data.log === 'string' ? data.log : JSON.stringify(data.log)?.substring(0, 255)),
                log: data.log,
                level,
                origem,
                application: data.application,
                chaveAcessoReference,
                userId,
                userEmail,
                userRoles,
                userCredentials,
                status,
                deveCorrigir,
                dispararAlerta,
                alertaDisparado,
                alertDetails,
                metadata,
            });

            return await this.logRepository.save(logEntity);
        } catch (error) {
            console.trace('Falha ao registrar log no banco de dados:', error);
            throw error;
        }
    }

    /**
     * Consumo de logs do cliente (Angular, Web, Mobile)
     */
    async registerClientLog(data: CreateLogDto, req?: any): Promise<Log> {
        return await this.register({
            ...data,
            origem: data.origem || 'CLIENT',
            application: data.application || 'ci-apps',
        }, req);
    }

    /**
     * Consumo de logs do servidor (NestJS, interceptors, jobs)
     */
    async registerServerLog(data: CreateLogDto, req?: any): Promise<Log> {
        return await this.register({
            ...data,
            origem: data.origem || 'SERVER',
            application: data.application || 'server',
        }, req);
    }

    /**
     * Consulta paginada com filtros avançados
     */
    async query(query: QueryLogDto): Promise<{ items: Log[]; total: number; limit: number; offset: number }> {
        const qb = this.logRepository.createQueryBuilder('log');

        if (query.level) {
            qb.andWhere('log.level = :level', { level: query.level });
        }
        if (query.origem) {
            qb.andWhere('log.origem = :origem', { origem: query.origem });
        }
        if (query.application) {
            qb.andWhere('log.application = :application', { application: query.application });
        }
        if (query.status) {
            qb.andWhere('log.status = :status', { status: query.status });
        }
        if (query.deveCorrigir !== undefined) {
            qb.andWhere('log.deveCorrigir = :deveCorrigir', { deveCorrigir: query.deveCorrigir });
        }
        if (query.dispararAlerta !== undefined) {
            qb.andWhere('log.dispararAlerta = :dispararAlerta', { dispararAlerta: query.dispararAlerta });
        }
        if (query.alertaDisparado !== undefined) {
            qb.andWhere('log.alertaDisparado = :alertaDisparado', { alertaDisparado: query.alertaDisparado });
        }
        if (query.userId) {
            qb.andWhere('log.userId = :userId', { userId: query.userId });
        }
        if (query.search) {
            qb.andWhere('(log.message ILIKE :search OR CAST(log.log AS text) ILIKE :search)', {
                search: `%${query.search}%`,
            });
        }
        if (query.startDate && query.endDate) {
            qb.andWhere('log.cratedAt BETWEEN :start AND :end', {
                start: new Date(query.startDate),
                end: new Date(query.endDate),
            });
        } else if (query.startDate) {
            qb.andWhere('log.cratedAt >= :start', { start: new Date(query.startDate) });
        } else if (query.endDate) {
            qb.andWhere('log.cratedAt <= :end', { end: new Date(query.endDate) });
        }

        const limit = query.limit || 50;
        const offset = query.offset || 0;

        qb.orderBy('log.cratedAt', 'DESC')
            .skip(offset)
            .take(limit);

        const [items, total] = await qb.getManyAndCount();

        return { items, total, limit, offset };
    }

    /**
     * Obtém detalhes de um log por seu identificador interno
     */
    async getById(internalId: string): Promise<Log> {
        const item = await this.logRepository.findOne({ where: { internalId } });
        if (!item) {
            throw new NotFoundException(`Log com ID '${internalId}' não encontrado.`);
        }
        return item;
    }

    /**
     * Atualiza o estado do log (se deve ser corrigido, status, disparo de alertas)
     */
    async updateState(dto: UpdateLogStateDto): Promise<Log> {
        const log = await this.getById(dto.internalId);

        if (dto.status !== undefined) {
            log.status = dto.status;
        }
        if (dto.deveCorrigir !== undefined) {
            log.deveCorrigir = dto.deveCorrigir;
        }
        if (dto.dispararAlerta !== undefined) {
            log.dispararAlerta = dto.dispararAlerta;
        }
        if (dto.alertaDisparado !== undefined) {
            log.alertaDisparado = dto.alertaDisparado;
        }
        if (dto.alertDetails !== undefined) {
            log.alertDetails = {
                ...(log.alertDetails || {}),
                ...(dto.alertDetails || {}),
                updatedAt: new Date().toISOString(),
            };
        }

        // Se marcou para disparar alerta e ainda não foi disparado
        if (log.dispararAlerta && !log.alertaDisparado) {
            log.alertaDisparado = true;
            log.alertDetails = {
                ...(log.alertDetails || {}),
                triggeredAt: new Date().toISOString(),
                reason: 'Disparo manual solicitado na atualização de estado.',
                notifiedRoles: ['MASTER'],
            };
            this.notifyMasterAlert(log.message, log.alertDetails);
        }

        return await this.logRepository.save(log);
    }

    /**
     * Dispara alerta explícito para um log
     */
    async triggerAlert(internalId: string, alertInfo?: TriggerAlertDto): Promise<Log> {
        const log = await this.getById(internalId);

        log.dispararAlerta = true;
        log.alertaDisparado = true;
        log.alertDetails = {
            ...(log.alertDetails || {}),
            triggeredAt: new Date().toISOString(),
            reason: alertInfo?.reason || 'Disparo de alerta sob demanda acionado por usuário MASTER.',
            channels: alertInfo?.channels || ['SYSTEM', 'EMAIL', 'DASHBOARD'],
            extraDetails: alertInfo?.extraDetails,
        };

        this.notifyMasterAlert(log.message, log.alertDetails);

        return await this.logRepository.save(log);
    }

    /**
     * Simula/encaminha notificação de alerta para canais do sistema e usuários MASTER
     */
    private notifyMasterAlert(message?: string, alertDetails?: any) {
        console.warn(`[ALERTA MASTER DISPARADO]`, {
            timestamp: new Date().toISOString(),
            message,
            alertDetails,
        });
    }
}