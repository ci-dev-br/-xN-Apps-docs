import { ApiProperty } from "@nestjs/swagger";
import { LogLevel, LogStatus } from "../log.entity";

export class CreateLogDto {
    @ApiProperty({ title: 'Mensagem do Log', required: false })
    message?: string;

    @ApiProperty({ title: 'Payload ou dados do Log', required: true })
    log: any;

    @ApiProperty({ title: 'Nível do Log', required: false, enum: LogLevel, default: LogLevel.INFO })
    level?: string;

    @ApiProperty({ title: 'Origem do Log (CLIENT ou SERVER)', required: false, default: 'SERVER' })
    origem?: string;

    @ApiProperty({ title: 'Nome da aplicação', required: false })
    application?: string;

    @ApiProperty({ title: 'Chave de acesso de referência', required: false })
    chaveAcessoReference?: string;

    @ApiProperty({ title: 'ID do Usuário', required: false })
    userId?: string;

    @ApiProperty({ title: 'E-mail do Usuário', required: false })
    userEmail?: string;

    @ApiProperty({ title: 'Roles do Usuário', required: false, type: [String] })
    userRoles?: string[];

    @ApiProperty({ title: 'Credenciais de acesso do usuário', required: false })
    userCredentials?: any;

    @ApiProperty({ title: 'Estado do Log', required: false, enum: LogStatus, default: LogStatus.NEW })
    status?: string;

    @ApiProperty({ title: 'Indica se deve ser corrigido', required: false })
    deveCorrigir?: boolean;

    @ApiProperty({ title: 'Indica se deve disparar alerta', required: false })
    dispararAlerta?: boolean;

    @ApiProperty({ title: 'Indica se alerta já foi disparado', required: false })
    alertaDisparado?: boolean;

    @ApiProperty({ title: 'Detalhes de alerta', required: false })
    alertDetails?: any;

    @ApiProperty({ title: 'Metadados contextuais (URL, IP, User-Agent, etc.)', required: false })
    metadata?: any;
}

export class UpdateLogStateDto {
    @ApiProperty({ title: 'ID Interno do Log', required: true })
    internalId: string;

    @ApiProperty({ title: 'Novo Estado do Log', required: false, enum: LogStatus })
    status?: string;

    @ApiProperty({ title: 'Indica se deve ser corrigido', required: false })
    deveCorrigir?: boolean;

    @ApiProperty({ title: 'Indica se deve disparar alerta', required: false })
    dispararAlerta?: boolean;

    @ApiProperty({ title: 'Indica se o alerta foi disparado', required: false })
    alertaDisparado?: boolean;

    @ApiProperty({ title: 'Detalhes do Alerta', required: false })
    alertDetails?: any;
}

export class QueryLogDto {
    @ApiProperty({ title: 'Nível do Log', required: false, enum: LogLevel })
    level?: string;

    @ApiProperty({ title: 'Origem do Log', required: false })
    origem?: string;

    @ApiProperty({ title: 'Aplicação', required: false })
    application?: string;

    @ApiProperty({ title: 'Estado do Log', required: false, enum: LogStatus })
    status?: string;

    @ApiProperty({ title: 'Filtrar se deve ser corrigido', required: false })
    deveCorrigir?: boolean;

    @ApiProperty({ title: 'Filtrar se dispara alerta', required: false })
    dispararAlerta?: boolean;

    @ApiProperty({ title: 'Filtrar se alerta foi disparado', required: false })
    alertaDisparado?: boolean;

    @ApiProperty({ title: 'ID do Usuário', required: false })
    userId?: string;

    @ApiProperty({ title: 'Termo de busca na mensagem', required: false })
    search?: string;

    @ApiProperty({ title: 'Data de início (ISO string)', required: false })
    startDate?: string;

    @ApiProperty({ title: 'Data de término (ISO string)', required: false })
    endDate?: string;

    @ApiProperty({ title: 'Limite de registros', required: false, default: 50 })
    limit?: number;

    @ApiProperty({ title: 'Deslocamento de paginação', required: false, default: 0 })
    offset?: number;
}

export class TriggerAlertDto {
    @ApiProperty({ title: 'ID Interno do Log', required: true })
    internalId: string;

    @ApiProperty({ title: 'Motivo do Alerta', required: false })
    reason?: string;

    @ApiProperty({ title: 'Canais de disparo', required: false, type: [String] })
    channels?: string[];

    @ApiProperty({ title: 'Detalhes adicionais do alerta', required: false })
    extraDetails?: any;
}
