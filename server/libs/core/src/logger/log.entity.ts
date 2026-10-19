import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { schema } from "../schema";
import { ApiProperty } from "@nestjs/swagger";

export enum LogStatus {
    NEW = 'NOVO',
    PENDING = 'PENDENTE',
    IN_PROGRESS = 'EM_ANALISE',
    RESOLVED = 'CORRIGIDO',
    IGNORED = 'IGNORADO',
}

export enum LogLevel {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug',
    TRACE = 'trace',
    FATAL = 'fatal',
}

/**
 * Registro de Log no sistema
 */
@Entity({ schema })
export class Log {
    @ApiProperty({ title: 'Identificador Interno', required: false })
    @PrimaryGeneratedColumn('uuid')
    internalId: string;

    @ApiProperty({ title: 'Chave de Acesso', required: false })
    @Column({ nullable: true })
    chaveAcessoReference?: string;

    @ApiProperty({ title: 'ID do Usuário', required: false })
    @Column({ nullable: true })
    userId?: string;

    @ApiProperty({ title: 'E-mail do Usuário', required: false })
    @Column({ nullable: true })
    userEmail?: string;

    @ApiProperty({ title: 'Roles do Usuário', required: false, type: [String] })
    @Column({ type: 'jsonb', nullable: true })
    userRoles?: string[];

    @ApiProperty({ title: 'Credenciais de Acesso do Usuário', required: false })
    @Column({ type: 'jsonb', nullable: true })
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

    @ApiProperty({ title: 'Mensagem do Log', required: false })
    @Column({ nullable: true })
    message?: string;

    @ApiProperty({ title: 'Registro de Log / Payload', required: false })
    @Column({ type: 'jsonb', nullable: true })
    log?: any;

    @ApiProperty({ title: 'Nível do Log', required: false, enum: LogLevel })
    @Column({ nullable: true, default: 'info' })
    level?: string;

    @ApiProperty({ title: 'Origem do Log', required: false, description: 'CLIENT, SERVER, CLIENT_ANGULAR, SERVER_NESTJS, etc.' })
    @Column({ nullable: true })
    origem?: string;

    @ApiProperty({ title: 'Aplicação de Origem', required: false })
    @Column({ nullable: true })
    application?: string;

    @ApiProperty({ title: 'Estado do Log', required: false, enum: LogStatus, default: LogStatus.NEW })
    @Column({ nullable: true, default: LogStatus.NEW })
    status?: string;

    @ApiProperty({ title: 'Indica se deve ser corrigido', required: false, default: false })
    @Column({ type: 'boolean', default: false })
    deveCorrigir?: boolean;

    @ApiProperty({ title: 'Indica se deve disparar alerta', required: false, default: false })
    @Column({ type: 'boolean', default: false })
    dispararAlerta?: boolean;

    @ApiProperty({ title: 'Indica se o alerta já foi disparado', required: false, default: false })
    @Column({ type: 'boolean', default: false })
    alertaDisparado?: boolean;

    @ApiProperty({ title: 'Detalhes do Disparo de Alerta', required: false })
    @Column({ type: 'jsonb', nullable: true })
    alertDetails?: any;

    @ApiProperty({ title: 'Metadados contextuais adicionais', required: false })
    @Column({ type: 'jsonb', nullable: true })
    metadata?: {
        url?: string;
        method?: string;
        statusCode?: number;
        ip?: string;
        userAgent?: string;
        timestamp?: string;
        [key: string]: any;
    };

    @CreateDateColumn()
    cratedAt?: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt?: Date;
}